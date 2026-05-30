"use client";

import type React from "react";
import {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useNotification } from "./notification-context";
import { useRouter } from "next/navigation";

export type UserRole = "member" | "owner";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
  customPermissions: {
    canEditTransactions: boolean;
    canUploadReceipts: boolean;
    canEditNotes: boolean;
  };
  preferences: {
    spendingLimit: number;
    quickTransferCategories?: string[];
  };
};

type AuthContextType = {
  user: User | null;
  userData: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error?: string; message?: string }>;
  logout: () => Promise<void>;
  updatePersonalSettings: (
    settings: Partial<User["preferences"]>,
  ) => Promise<void>;
  updateUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  updateUserPermissions: (
    userId: string,
    permissions: Partial<User["customPermissions"]>,
  ) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  activityLog: any[];
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

const defaultPermissionsForRole = (_role: UserRole) => ({
  canEditTransactions: true,
  canUploadReceipts: true,
  canEditNotes: true,
});

const defaultPreferences = {
  spendingLimit: 300000,
  quickTransferCategories: [] as string[],
};

const resolveOwnerAccess = async (
  firebaseUser: import("firebase/auth").User,
) => {
  try {
    const token = await firebaseUser.getIdToken();
    const response = await fetch("/api/auth/owner-access", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) return false;
    const data = (await response.json()) as { owner?: boolean };
    return Boolean(data.owner);
  } catch (err) {
    console.warn("Owner access check failed:", err);
    return false;
  }
};

const normalizeUserData = (id: string, data: any): User => {
  const role: UserRole =
    data?.internalRole === "owner" || data?.role === "owner"
      ? "owner"
      : "member";
  return {
    id,
    email: data?.email ?? "",
    name: data?.name ?? "",
    role,
    isActive: data?.isActive ?? true,
    createdAt: data?.createdAt ?? new Date().toISOString(),
    lastLogin: data?.lastLogin ?? null,
    customPermissions: {
      ...defaultPermissionsForRole(role),
      ...(data?.customPermissions ?? {}),
    },
    preferences: {
      ...defaultPreferences,
      ...(data?.preferences ?? {}),
    },
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const { addNotification } = useNotification();
  const router = useRouter();

  const recordActivity = useCallback((type: string, details: any) => {
    const newActivity = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type,
      ...details,
    };
    setActivityLog((prev) => [newActivity, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (!firebaseUser) {
        setUser(null);
        setUserData(null);
        setAllUsers([]);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const now = new Date().toISOString();

        const ownerAccess = await resolveOwnerAccess(firebaseUser);
        const internalRole: UserRole =
          ownerAccess ||
          userSnap.data()?.internalRole === "owner" ||
          userSnap.data()?.role === "owner"
            ? "owner"
            : "member";

        if (!userSnap.exists()) {
          const payload: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || firebaseUser.email || "",
            role: internalRole,
            isActive: true,
            createdAt: now,
            lastLogin: now,
            customPermissions: defaultPermissionsForRole(internalRole),
            preferences: defaultPreferences,
          };
          await setDoc(
            userRef,
            { ...payload, publicRole: "member", internalRole },
            { merge: true },
          );
          setUser(payload);
          setUserData(payload);
        } else {
          const normalized = normalizeUserData(firebaseUser.uid, {
            ...userSnap.data(),
            internalRole,
          });
          await setDoc(
            userRef,
            {
              publicRole: "member",
              internalRole,
              lastLogin: now,
              preferences: normalized.preferences,
            },
            { merge: true },
          );
          setUser(normalized);
          setUserData({ ...normalized, lastLogin: now });
        }
      } catch (err: any) {
        console.error("Error loading user profile:", err);
        setError("Failed to load user profile");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!userData || userData.role !== "owner") {
      setAllUsers(userData ? [userData] : []);
      return;
    }

    const usersQuery = query(collection(db, "users"));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const nextUsers = snapshot.docs.map((docSnap) =>
        normalizeUserData(docSnap.id, docSnap.data()),
      );
      setAllUsers(nextUsers);
    });

    return () => unsubscribe();
  }, [userData]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        await signInWithEmailAndPassword(auth, email, password);
        recordActivity("login", { email });

        addNotification({
          message: "Logged in successfully!",
          type: "success",
        });
      } catch (err: any) {
        console.error("Login error:", err);
        const errorMessage =
          err.message ||
          "Failed to log in. Please check your credentials and try again.";
        setError(errorMessage);
        addNotification({
          message: `Login failed: ${errorMessage}`,
          type: "error",
        });
        router.push("/");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addNotification, recordActivity],
  );

  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const ownerAccess = await resolveOwnerAccess(firebaseUser);
          const internalRole: UserRole = ownerAccess ? "owner" : "member";
          const now = new Date().toISOString();
          const payload: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || firebaseUser.email || "",
            role: internalRole,
            isActive: true,
            createdAt: now,
            lastLogin: now,
            customPermissions: defaultPermissionsForRole(internalRole),
            preferences: defaultPreferences,
          };
          await setDoc(
            userRef,
            { ...payload, publicRole: "member", internalRole },
            { merge: true },
          );
        }
      }

      recordActivity("google_login", { email: firebaseUser?.email });

      addNotification({
        message: "Logged in with Google successfully!",
        type: "success",
      });
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message);
      addNotification({
        message: `Google login failed: ${err.message}`,
        type: "error",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification, recordActivity]);

  const signup = useCallback(
    async (email: string, password: string, name: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name });
        }

        const now = new Date().toISOString();
        const payload: User = {
          id: result.user.uid,
          email,
          name,
          role: "member",
          isActive: true,
          createdAt: now,
          lastLogin: now,
          customPermissions: defaultPermissionsForRole("member"),
          preferences: defaultPreferences,
        };

        await setDoc(
          doc(db, "users", result.user.uid),
          { ...payload, publicRole: "member", internalRole: "member" },
          { merge: true },
        );
        recordActivity("signup", { email, role: "member" });

        addNotification({
          message: "Account created successfully!",
          type: "success",
        });
        return { message: "Account created successfully!" };
      } catch (err: any) {
        console.error("Signup error:", err);
        setError(err.message);
        addNotification({
          message: `Signup failed: ${err.message}`,
          type: "error",
        });
        return { error: err.message };
      } finally {
        setLoading(false);
      }
    },
    [addNotification, recordActivity],
  );

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      await signOut(auth);

      if (user) {
        recordActivity("logout", { userId: user.id, email: user.email });
      }

      setUser(null);
      setUserData(null);

      addNotification({
        message: "Logged out successfully!",
        type: "info",
      });
    } catch (err: any) {
      console.error("Logout error:", err);
      setError(err.message);
      addNotification({
        message: `Logout failed: ${err.message}`,
        type: "error",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addNotification, user, recordActivity]);

  const updatePersonalSettings = useCallback(
    async (settings: Partial<User["preferences"]>) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const nextPreferences = {
        ...user.preferences,
        ...settings,
      };

      await setDoc(
        doc(db, "users", user.id),
        {
          preferences: nextPreferences,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      setUser({ ...user, preferences: nextPreferences });
      setUserData(
        userData ? { ...userData, preferences: nextPreferences } : null,
      );
      recordActivity("personal_settings_update", { userId: user.id });
    },
    [recordActivity, user, userData],
  );

  const updateUserStatus = useCallback(
    async (userId: string, isActive: boolean) => {
      try {
        await updateDoc(doc(db, "users", userId), { isActive });

        recordActivity("user_status_update", { userId, isActive });
        addNotification({
          message: `User status updated to ${isActive ? "active" : "inactive"}.`,
          type: "success",
        });
      } catch (err: any) {
        console.error("Error updating user status:", err);
        addNotification({
          message: `Failed to update user status: ${err.message}`,
          type: "error",
        });
        throw err;
      }
    },
    [addNotification, recordActivity],
  );

  const updateUserPermissions = useCallback(
    async (userId: string, permissions: Partial<User["customPermissions"]>) => {
      try {
        const userRef = doc(db, "users", userId);
        const current = await getDoc(userRef);
        const existing = current.exists()
          ? (current.data()?.customPermissions ?? {})
          : {};
        await updateDoc(userRef, {
          customPermissions: { ...existing, ...permissions },
        });

        recordActivity("permissions_update", { userId, permissions });
        addNotification({
          message: "User permissions updated successfully!",
          type: "success",
        });
      } catch (err: any) {
        console.error("Error updating user permissions:", err);
        addNotification({
          message: `Failed to update user permissions: ${err.message}`,
          type: "error",
        });
        throw err;
      }
    },
    [addNotification, recordActivity],
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      try {
        await deleteDoc(doc(db, "users", userId));

        recordActivity("user_deleted", { userId });

        addNotification({
          message: "User has been deleted successfully.",
          type: "success",
        });
      } catch (err: any) {
        console.error("Error deleting user:", err);
        addNotification({
          message: `Failed to delete user: ${err.message}`,
          type: "error",
        });
        throw err;
      }
    },
    [addNotification, recordActivity],
  );

  const contextValue = useMemo(
    () => ({
      user,
      userData,
      users: allUsers,
      loading,
      error,
      login,
      loginWithGoogle,
      signup,
      logout,
      updatePersonalSettings,
      updateUserStatus,
      updateUserPermissions,
      deleteUser,
      activityLog,
    }),
    [
      user,
      userData,
      allUsers,
      loading,
      error,
      login,
      loginWithGoogle,
      signup,
      logout,
      updatePersonalSettings,
      updateUserStatus,
      updateUserPermissions,
      deleteUser,
      activityLog,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
