"use client"

import { useRouter } from "next/navigation"
import type React from "react"
import { createContext, useState, useEffect, useContext, useCallback } from "react"
import { useNotification } from "./notification-context"
import * as authService from "@/services/authService"
import type { User } from "@/services/authService"
import { auth } from "@/lib/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"

export type UserRole = "main-admin" | "college-admin" | "department-user" | "editor" | "viewer"

export type { User } from "@/services/authService"

type AuthContextType = {
  user: User | null
  userData: User | null
  users: User[]
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signup: (
    email: string,
    password: string,
    name: string,
    role: "admin" | "department-user",
  ) => Promise<{ error?: string; message?: string }>
  logout: () => Promise<void>
  updateUserStatus: (userId: string, isActive: boolean) => Promise<void>
  updateUserPermissions: (userId: string, permissions: Partial<User["customPermissions"]>) => Promise<void>
  updateUserRole: (userId: string, role: "admin" | "member") => Promise<void>
  deleteUser: (userId: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activityLog, setActivityLog] = useState<any[]>([])
  const router = useRouter()
  const { addNotification } = useNotification()

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const users = await authService.getAllUsers()
        setAllUsers(users)
      } catch (err) {
        console.error("Error loading users:", err)
        setError("Failed to load users")
      }
    }

    // Set up Firebase Auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user data from Firestore
          const userDoc = await authService.getUserById(firebaseUser.uid)
          if (userDoc) {
            setUser(userDoc)
            setUserData(userDoc)
          }
        } catch (err) {
          console.error("Error loading user data:", err)
          setError("Failed to load user data")
        }
      } else {
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
    })

    loadInitialData()

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  const recordActivity = useCallback((type: string, details: any) => {
    const newActivity = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type,
      ...details,
    }
    setActivityLog((prev) => [newActivity, ...prev].slice(0, 100))
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true)
      setError(null)

      try {
        const loggedInUser = await authService.loginWithEmail(email, password)
        setUser(loggedInUser)
        setUserData(loggedInUser)

        // Refresh users list
        const users = await authService.getAllUsers()
        setAllUsers(users)

        recordActivity("login", { userId: loggedInUser.id, email: loggedInUser.email })

        addNotification({
          message: "Logged in successfully!",
          type: "success",
        })
      } catch (err: any) {
        console.error("Login error:", err)
        // Set a more user-friendly error message
        const errorMessage = err.message || "Failed to log in. Please check your credentials and try again."
        setError(errorMessage)
        addNotification({
          message: `Login failed: ${errorMessage}`,
          type: "error",
        })
        throw err
      } finally {
        setLoading(false)
      }
    },
    [addNotification, recordActivity],
  )

  const loginWithGoogle = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const loggedInUser = await authService.loginWithGoogle()
      setUser(loggedInUser)
      setUserData(loggedInUser)

      // Refresh users list
      const users = await authService.getAllUsers()
      setAllUsers(users)

      recordActivity("google_login", { userId: loggedInUser.id, email: loggedInUser.email })

      addNotification({
        message: "Logged in with Google successfully!",
        type: "success",
      })
    } catch (err: any) {
      console.error("Google login error:", err)
      setError(err.message)
      addNotification({
        message: `Google login failed: ${err.message}`,
        type: "error",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addNotification, recordActivity])

  const signup = useCallback(
    async (email: string, password: string, name: string, role: "admin" | "department-user") => {
      setLoading(true)
      setError(null)

      try {
        const result = await authService.signup(email, password, name, role)

        // Refresh users list
        const users = await authService.getAllUsers()
        setAllUsers(users)

        recordActivity("signup", { email, role })

        addNotification({
          message: "Account created successfully! Please wait for admin approval before logging in.",
          type: "success",
        })
        return result
      } catch (err: any) {
        console.error("Signup error:", err)
        setError(err.message)
        addNotification({
          message: `Signup failed: ${err.message}`,
          type: "error",
        })
        return { error: err.message }
      } finally {
        setLoading(false)
      }
    },
    [addNotification, recordActivity],
  )

  const logout = useCallback(async () => {
    setLoading(true)

    try {
      await authService.logout()

      if (user) {
        recordActivity("logout", { userId: user.id, email: user.email })
      }

      setUser(null)
      setUserData(null)

      addNotification({
        message: "Logged out successfully!",
        type: "info",
      })
    } catch (err: any) {
      console.error("Logout error:", err)
      setError(err.message)
      addNotification({
        message: `Logout failed: ${err.message}`,
        type: "error",
      })
      throw err
    } finally {
      setLoading(false)
    }
  }, [addNotification, user, recordActivity])

  const updateUserStatus = useCallback(
    async (userId: string, isActive: boolean) => {
      try {
        await authService.updateUserStatus(userId, isActive)

        // Refresh users list
        const users = await authService.getAllUsers()
        setAllUsers(users)

        recordActivity("user_status_update", { userId, isActive })
        addNotification({
          message: `User status updated to ${isActive ? "active" : "inactive"}.`,
          type: "success",
        })
      } catch (err: any) {
        console.error("Error updating user status:", err)
        addNotification({
          message: `Failed to update user status: ${err.message}`,
          type: "error",
        })
        throw err
      }
    },
    [addNotification, recordActivity],
  )

  const updateUserPermissions = useCallback(
    async (userId: string, permissions: Partial<User["customPermissions"]>) => {
      try {
        await authService.updateUserPermissions(userId, permissions)

        // Refresh users list
        const users = await authService.getAllUsers()
        setAllUsers(users)

        recordActivity("permissions_update", { userId, permissions })
        addNotification({
          message: "User permissions updated successfully!",
          type: "success",
        })
      } catch (err: any) {
        console.error("Error updating user permissions:", err)
        addNotification({
          message: `Failed to update user permissions: ${err.message}`,
          type: "error",
        })
        throw err
      }
    },
    [addNotification, recordActivity],
  )

  const updateUserRole = useCallback(
    async (userId: string, role: "admin" | "member") => {
      try {
        await authService.updateUserRole(userId, role)

        // Refresh users list
        const users = await authService.getAllUsers()
        setAllUsers(users)

        recordActivity("role_update", { userId, newRole: role })

        addNotification({
          message: `User role updated to ${role === "admin" ? "Admin" : "Department User"} successfully!`,
          type: "success",
        })
      } catch (err: any) {
        console.error("Error updating user role:", err)
        addNotification({
          message: `Failed to update user role: ${err.message}`,
          type: "error",
        })
        throw err
      }
    },
    [addNotification, recordActivity],
  )

  const deleteUser = useCallback(
    async (userId: string) => {
      try {
        await authService.deleteUser(userId)

        // Refresh users list
        const users = await authService.getAllUsers()
        setAllUsers(users)

        recordActivity("user_deleted", { userId })

        addNotification({
          message: "User has been deleted successfully.",
          type: "success",
        })
      } catch (err: any) {
        console.error("Error deleting user:", err)
        addNotification({
          message: `Failed to delete user: ${err.message}`,
          type: "error",
        })
        throw err
      }
    },
    [addNotification, recordActivity],
  )

  const contextValue = {
    user,
    userData,
    users: allUsers,
    loading,
    error,
    login,
    loginWithGoogle,
    signup,
    logout,
    updateUserStatus,
    updateUserPermissions,
    updateUserRole,
    deleteUser,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
