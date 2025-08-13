// Auth Service Layer - All authentication logic centralized here
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  signInWithPopup,
  updatePassword,
  type User as FirebaseUser,
  fetchSignInMethodsForEmail,
  EmailAuthProvider,
  signInWithCredential
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs 
} from 'firebase/firestore'
import { auth, db, googleProvider } from '@/lib/firebaseConfig'

export interface User {
  id: string
  email: string
  password?: string
  name: string
  role: "admin" | "member" | "viewer"
  isActive: boolean
  createdAt: string
  lastLogin: string | null
  customPermissions: {
    canEditTransactions: boolean
    canUploadReceipts: boolean
    canEditNotes: boolean
  }
}


// Get all users from Firestore
export const getAllUsers = async (): Promise<User[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "users"))
    const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[]
    
    // If no users exist, create the default admin user
    if (users.length === 0) {
      await createDefaultAdminAccount()
      return [await getDefaultAdminUser()]
    }
    
    return users
  } catch (error) {
    console.error("Get all users error:", error)
    // Return empty array as fallback
    return []
  }
}

// Create default admin account
export const createDefaultAdminAccount = async (): Promise<void> => {
  try {
    const adminDoc = await getDoc(doc(db, "users", "default-admin"))
    
    if (!adminDoc.exists()) {
      const defaultAdmin: User = {
        id: "default-admin",
        email: "admin@ctrlfund.com",
        name: "Main Admin",
        role: "admin",
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: null,
        customPermissions: {
          canEditTransactions: true,
          canUploadReceipts: true,
          canEditNotes: true,
        },
      }
      
      await setDoc(doc(db, "users", defaultAdmin.id), defaultAdmin)
      console.log("Default admin account created successfully")
    }
  } catch (error) {
    console.error("Error creating default admin account:", error)
  }
}

// Get default admin user
export const getDefaultAdminUser = async (): Promise<User> => {
  const adminDoc = await getDoc(doc(db, "users", "default-admin"))
  if (adminDoc.exists()) {
    return { id: adminDoc.id, ...adminDoc.data() } as User
  }
  
  // Fallback default admin
  return {
    id: "default-admin",
    email: "admin@ctrlfund.com",
    name: "Main Admin",
    role: "admin",
    isActive: true,
    createdAt: new Date().toISOString(),
    lastLogin: null,
    customPermissions: {
      canEditTransactions: true,
      canUploadReceipts: true,
      canEditNotes: true,
    },
  }
}

// Get user by ID from Firestore
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User
    }
    return null
  } catch (error) {
    console.error("Get user by ID error:", error)
    return null
  }
}

// Real Google login function using Firebase
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const firebaseUser = result.user
    
    // Check if user document exists in Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
    
    if (userDoc.exists()) {
      // User exists, return their data
      const userData = userDoc.data() as User
      const updatedUser = { 
        ...userData, 
        lastLogin: new Date().toISOString() 
      }
      
      // Update last login
      await updateDoc(doc(db, "users", firebaseUser.uid), { 
        lastLogin: new Date().toISOString() 
      })
      
      return updatedUser
    } else {
      // New user, create document
      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || "Google User",
        role: "member", // New accounts are member by default
        isActive: false, // New accounts are inactive by default
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        customPermissions: {
          canEditTransactions: false,
          canUploadReceipts: true,
          canEditNotes: false,
        },
      }
      
      // Save to Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), newUser)
      
      return newUser
    }
  } catch (error: any) {
    console.error("Google login error:", error)
    
    // Handle specific Firebase errors
    if (error.code === 'auth/operation-not-allowed') {
      throw new Error("Google Sign-In is not enabled. Please contact your administrator.")
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error("Sign-in was cancelled. Please try again.")
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error("Pop-up was blocked. Please allow pop-ups for this site.")
    }
    
    throw new Error("Failed to sign in with Google. Please try again.")
  }
}

// Function to set password for Google users
export async function setPasswordForGoogleUser(password: string): Promise<void> {
  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      throw new Error("No user is currently signed in")
    }
    
    // Update password for the current user
    await updatePassword(currentUser, password)
  } catch (error: any) {
    console.error("Set password error:", error)
    if (error.code === 'auth/requires-recent-login') {
      throw new Error("Please sign in again to set your password")
    }
    throw new Error("Failed to set password")
  }
}

// Email and password login function using Firebase
export async function loginWithEmail(email: string, password: string): Promise<User> {
  try {
    // Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    
    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
    
    if (userDoc.exists()) {
      // Check if user is active
      const userData = userDoc.data() as User
      
      if (!userData.isActive) {
        throw new Error("Your account is not active. Please contact an administrator.")
      }
      
      // Update last login time
      const updatedUser = { 
        ...userData, 
        lastLogin: new Date().toISOString() 
      }
      
      await updateDoc(doc(db, "users", firebaseUser.uid), { 
        lastLogin: new Date().toISOString() 
      })
      
      return updatedUser
    } else {
      // This should not happen normally, but handle it just in case
      throw new Error("User account not found. Please contact support.")
    }
  } catch (error: any) {
    console.error("Email login error:", error)
    
    // Handle specific Firebase errors
    if (error.code === 'auth/invalid-credential') {
      console.error('Invalid credential error:', error.code, error.message);
      throw new Error("Invalid email or password. Your credentials don't match our records.")
    } else if (error.code === 'auth/user-not-found') {
      console.error('User not found error:', error.code, error.message);
      throw new Error("No account found with this email. Please check your email or sign up.")
    } else if (error.code === 'auth/wrong-password') {
      console.error('Wrong password error:', error.code, error.message);
      throw new Error("Incorrect password. Please try again or reset your password.")
    } else if (error.code === 'auth/user-disabled') {
      throw new Error("This account has been disabled")
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error("Too many failed login attempts. Please try again later")
    }
    
    // Re-throw the error if it's our custom error
    if (error.message.includes("Your account is not active") || 
        error.message.includes("User account not found")) {
      throw error
    }
    
    throw new Error("Failed to sign in. Please try again.")
  }
}

// Note: These imports are already declared at the top of the file
// Keeping this comment as a reminder that we fixed duplicate imports

// Create new user account
export async function signup(
  email: string,
  password: string,
  name: string,
  role: "admin" | "department-user",
): Promise<{ message: string } | { error: string }> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    
    // Map role to internal role system
    const userRole: "admin" | "member" | "viewer" = role === "admin" ? "admin" : "member"

    const newUser: User = {
      id: firebaseUser.uid,
      email,
      name,
      role: userRole,
      isActive: false, // All new accounts are inactive by default
      createdAt: new Date().toISOString(),
      lastLogin: null,
      customPermissions: {
        canEditTransactions: role === "admin",
        canUploadReceipts: true,
        canEditNotes: role === "admin",
      },
    }

    // Save to Firestore
    await setDoc(doc(db, "users", firebaseUser.uid), newUser)

    return {
      message:
        "Account created successfully! Your account is pending approval from the main admin. You will be notified once activated.",
    }
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("User with this email already exists")
    }
    throw new Error("Failed to create account")
  }
}

// Logout function using Firebase
export async function logout(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Logout error:", error)
    throw new Error("Failed to sign out")
  }
}

// Update user status (activate/deactivate)
export async function updateUserStatus(userId: string, isActive: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, "users", userId), { isActive })
  } catch (error) {
    console.error("Update user status error:", error)
    throw new Error("Failed to update user status")
  }
}

// Update user permissions
export async function updateUserPermissions(
  userId: string,
  permissions: Partial<User["customPermissions"]>,
): Promise<void> {
  try {
    await updateDoc(doc(db, "users", userId), { customPermissions: permissions })
  } catch (error) {
    console.error("Update user permissions error:", error)
    throw new Error("Failed to update user permissions")
  }
}

// Update user role
export async function updateUserRole(userId: string, role: "admin" | "member"): Promise<void> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    
    if (!userDoc.exists()) {
      throw new Error("User not found")
    }
    
    const userData = userDoc.data() as User
    
    // Prevent changing the main admin's role
    if (userData.email === "admin@ctrlfund.com") {
      throw new Error("Cannot change the main admin's role")
    }

    // Update role and adjust permissions accordingly
    const updatedPermissions = {
      canEditTransactions: role === "admin",
      canUploadReceipts: true,
      canEditNotes: role === "admin",
    }

    await updateDoc(doc(db, "users", userId), { 
      role, 
      customPermissions: updatedPermissions 
    })
  } catch (error) {
    console.error("Update user role error:", error)
    throw new Error("Failed to update user role")
  }
}

// Delete user
export async function deleteUser(userId: string): Promise<void> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    
    if (!userDoc.exists()) {
      throw new Error("User not found")
    }
    
    const userData = userDoc.data() as User
    
    // Prevent deleting the main admin
    if (userData.email === "admin@ctrlfund.com") {
      throw new Error("Cannot delete the main admin account")
    }

    await deleteDoc(doc(db, "users", userId))
  } catch (error) {
    console.error("Delete user error:", error)
    throw new Error("Failed to delete user")
  }
}
