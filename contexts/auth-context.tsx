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
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useNotification } from "./notification-context";
import { useRouter } from "next/navigation";

export type UserRole = "member";

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

const normalizeUserData = (id: string, data: any): User => {
  const role: UserRole = "member";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotification();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      if (!firebaseUser) {
        setUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        const now = new Date().toISOString();

        if (!userSnap.exists()) {
          const payload: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || firebaseUser.email || "",
            role: "member",
            isActive: true,
            createdAt: now,
            lastLogin: now,
            customPermissions: defaultPermissionsForRole("member"),
            preferences: defaultPreferences,
          };
          await setDoc(
            userRef,
            payload,
            { merge: true },
          );
          setUser(payload);
          setUserData(payload);
        } else {
          const normalized = normalizeUserData(firebaseUser.uid, {
            ...userSnap.data(),
          });
          await setDoc(
            userRef,
            {
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

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        await signInWithEmailAndPassword(auth, email, password);
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
    [addNotification],
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
          const now = new Date().toISOString();
          const payload: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || firebaseUser.email || "",
            role: "member",
            isActive: true,
            createdAt: now,
            lastLogin: now,
            customPermissions: defaultPermissionsForRole("member"),
            preferences: defaultPreferences,
          };
          await setDoc(
            userRef,
            payload,
            { merge: true },
          );
        }
      }

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
  }, [addNotification]);

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
          payload,
          { merge: true },
        );

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
    [addNotification],
  );

  const logout = useCallback(async () => {
    setLoading(true);

    try {
      await signOut(auth);

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
  }, [addNotification, user]);

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
    },
    [user, userData],
  );

  const contextValue = useMemo(
    () => ({
      user,
      userData,
      loading,
      error,
      login,
      loginWithGoogle,
      signup,
      logout,
      updatePersonalSettings,
    }),
    [
      user,
      userData,
      loading,
      error,
      login,
      loginWithGoogle,
      signup,
      logout,
      updatePersonalSettings,
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
