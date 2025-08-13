"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./auth-context"
import { useNotification } from "./notification-context"

type UserRole = "admin" | "member" | "viewer"

type Permissions = {
  canViewDashboard: boolean
  canViewTransactions: boolean
  canAddTransactions: boolean
  canEditTransactions: boolean
  canDeleteTransactions: boolean
  canArchiveTransactions: boolean
  canViewReceipts: boolean
  canUploadReceipts: boolean
  canDeleteReceipts: boolean
  canUploadToDrive: boolean
  canViewNotes: boolean
  canCreateNotes: boolean
  canEditNotes: boolean
  canDeleteNotes: boolean
  canArchiveNotes: boolean
  canAccessAdminHub: boolean
  canManageUsers: boolean
}

type RoleContextType = {
  currentRole: UserRole
  permissions: Permissions
  switchRole: (role: UserRole) => void
  availableRoles: UserRole[]
  loading: boolean
  error: string | null
  isAccountActive: boolean
}

const defaultPermissions: Record<UserRole, Permissions> = {
  admin: {
    canViewDashboard: true,
    canViewTransactions: true,
    canAddTransactions: true,
    canEditTransactions: true,
    canDeleteTransactions: true,
    canArchiveTransactions: true,
    canViewReceipts: true,
    canUploadReceipts: true,
    canDeleteReceipts: true,
    canUploadToDrive: true,
    canViewNotes: true,
    canCreateNotes: true,
    canEditNotes: true,
    canDeleteNotes: true,
    canArchiveNotes: true,
    canAccessAdminHub: true,
    canManageUsers: true,
  },
  member: {
    canViewDashboard: true,
    canViewTransactions: true,
    canAddTransactions: true,
    canEditTransactions: true,
    canDeleteTransactions: false,
    canArchiveTransactions: true,
    canViewReceipts: true,
    canUploadReceipts: true,
    canDeleteReceipts: false,
    canUploadToDrive: true,
    canViewNotes: true,
    canCreateNotes: true,
    canEditNotes: true,
    canDeleteNotes: false,
    canArchiveNotes: true,
    canAccessAdminHub: false,
    canManageUsers: false,
  },
  viewer: {
    canViewDashboard: true,
    canViewTransactions: true,
    canAddTransactions: false,
    canEditTransactions: false,
    canDeleteTransactions: false,
    canArchiveTransactions: false,
    canViewReceipts: true,
    canUploadReceipts: false,
    canDeleteReceipts: false,
    canUploadToDrive: false,
    canViewNotes: true,
    canCreateNotes: false,
    canEditNotes: false,
    canDeleteNotes: false,
    canArchiveNotes: false,
    canAccessAdminHub: false,
    canManageUsers: false,
  },
}

export const RoleContext = createContext<RoleContextType | undefined>(undefined)

const LOCAL_STORAGE_ROLE_KEY = "ctrlfund_user_roles"

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading, userData } = useAuth()
  const { addNotification } = useNotification()
  const [currentRole, setCurrentRole] = useState<UserRole>("viewer")
  const [permissions, setPermissions] = useState<Permissions>(defaultPermissions.viewer)
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(["viewer"])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAccountActive, setIsAccountActive] = useState(false)

  const fetchUserRole = useCallback(async () => {
    if (!user) {
      setCurrentRole("viewer")
      setPermissions(defaultPermissions.viewer)
      setAvailableRoles(["viewer"])
      setIsAccountActive(false)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userIsActive = userData?.isActive ?? false
      setIsAccountActive(userIsActive)

      if (!userIsActive) {
        // If account is inactive, set minimal permissions
        setCurrentRole("viewer")
        setPermissions({
          canViewDashboard: false,
          canViewTransactions: false,
          canAddTransactions: false,
          canEditTransactions: false,
          canDeleteTransactions: false,
          canArchiveTransactions: false,
          canViewReceipts: false,
          canUploadReceipts: false,
          canDeleteReceipts: false,
          canUploadToDrive: false,
          canViewNotes: false,
          canCreateNotes: false,
          canEditNotes: false,
          canDeleteNotes: false,
          canArchiveNotes: false,
          canAccessAdminHub: false,
          canManageUsers: false,
        })
        setAvailableRoles([])
        setLoading(false)
        return
      }

      const role: UserRole = userData?.role || "viewer"

      const customPermissions = userData?.customPermissions || {}

      // Get base permissions for the role
      const basePermissions = { ...defaultPermissions[role] }

      const finalPermissions: Permissions = {
        ...basePermissions,
        // Map custom permissions to role permissions
        canEditTransactions: customPermissions.canEditTransactions ?? basePermissions.canEditTransactions,
        canAddTransactions: customPermissions.canEditTransactions ?? basePermissions.canAddTransactions,
        canDeleteTransactions:
          (customPermissions.canEditTransactions ?? basePermissions.canEditTransactions) &&
          basePermissions.canDeleteTransactions,
        canArchiveTransactions: customPermissions.canEditTransactions ?? basePermissions.canArchiveTransactions,

        canUploadReceipts: customPermissions.canUploadReceipts ?? basePermissions.canUploadReceipts,
        canDeleteReceipts:
          (customPermissions.canUploadReceipts ?? basePermissions.canUploadReceipts) &&
          basePermissions.canDeleteReceipts,
        canUploadToDrive: customPermissions.canUploadReceipts ?? basePermissions.canUploadToDrive,

        canEditNotes: customPermissions.canEditNotes ?? basePermissions.canEditNotes,
        canCreateNotes: customPermissions.canEditNotes ?? basePermissions.canCreateNotes,
        canDeleteNotes:
          (customPermissions.canEditNotes ?? basePermissions.canEditNotes) && basePermissions.canDeleteNotes,
        canArchiveNotes: customPermissions.canEditNotes ?? basePermissions.canArchiveNotes,
      }

      setCurrentRole(role)
      setPermissions(finalPermissions)

      if (role === "admin") {
        setAvailableRoles(["admin", "member", "viewer"])
      } else if (role === "member") {
        setAvailableRoles(["member", "viewer"])
      } else {
        setAvailableRoles(["viewer"])
      }
    } catch (err: any) {
      console.error("Error fetching user role:", err)
      setError(err.message || "Failed to fetch user role.")
      addNotification({
        id: Date.now(),
        message: `Failed to load user role: ${err.message}`,
        type: "error",
      })
      setCurrentRole("viewer")
      setPermissions(defaultPermissions.viewer)
      setAvailableRoles(["viewer"])
      setIsAccountActive(false)
    } finally {
      setLoading(false)
    }
  }, [user, userData, addNotification])

  useEffect(() => {
    if (!authLoading) {
      fetchUserRole()
    }
  }, [authLoading, fetchUserRole])

  useEffect(() => {
    if (userData && !authLoading) {
      fetchUserRole()
    }
  }, [userData, authLoading, fetchUserRole])

  const switchRole = useCallback(
    async (newRole: UserRole) => {
      if (!user) {
        addNotification({
          id: Date.now(),
          message: "Cannot switch role: User not authenticated.",
          type: "error",
        })
        return
      }

      if (!isAccountActive) {
        addNotification({
          id: Date.now(),
          message: "Cannot switch role: Your account has been deactivated. Please contact an administrator.",
          type: "error",
        })
        return
      }

      if (!availableRoles.includes(newRole)) {
        addNotification({
          id: Date.now(),
          message: `You do not have permission to switch to the "${newRole}" role.`,
          type: "error",
        })
        return
      }

      setLoading(true)
      setError(null)

      try {
        await new Promise((resolve) => setTimeout(resolve, 200))

        if (typeof window !== "undefined") {
          const storedRoles = localStorage.getItem(LOCAL_STORAGE_ROLE_KEY)
          const roleData = storedRoles ? JSON.parse(storedRoles) : {}
          roleData[user.id] = {
            role: newRole,
            customPermissions: {},
            updatedAt: new Date().toISOString(),
          }
          localStorage.setItem(LOCAL_STORAGE_ROLE_KEY, JSON.stringify(roleData))
        }

        // Re-fetch to apply custom permissions
        await fetchUserRole()

        addNotification({
          id: Date.now(),
          message: `Switched to ${newRole} role successfully!`,
          type: "success",
        })
      } catch (err: any) {
        console.error("Error switching role:", err)
        setError(err.message || "Failed to switch role.")
        addNotification({
          id: Date.now(),
          message: `Failed to switch role: ${err.message}`,
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    },
    [user, availableRoles, addNotification, isAccountActive, fetchUserRole],
  )

  const contextValue = {
    currentRole,
    permissions,
    switchRole,
    availableRoles,
    loading: loading || authLoading,
    error,
    isAccountActive,
  }

  return <RoleContext.Provider value={contextValue}>{children}</RoleContext.Provider>
}

export const useRole = () => {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider")
  }
  return context
}
