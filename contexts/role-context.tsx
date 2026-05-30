"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./auth-context"
import { useNotification } from "./notification-context"

type UserRole = "member"

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
}

type RoleContextType = {
  currentRole: UserRole
  permissions: Permissions
  loading: boolean
  error: string | null
  isAccountActive: boolean
}

const defaultPermissions: Record<UserRole, Permissions> = {
  member: {
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
  },
}

export const RoleContext = createContext<RoleContextType | undefined>(undefined)

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading, userData } = useAuth()
  const { addNotification } = useNotification()
  const [currentRole, setCurrentRole] = useState<UserRole>("member")
  const [permissions, setPermissions] = useState<Permissions>(defaultPermissions.member)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAccountActive, setIsAccountActive] = useState(false)

  const fetchUserRole = useCallback(async () => {
    if (!user) {
      setCurrentRole("member")
      setPermissions(defaultPermissions.member)
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
        setCurrentRole("member")
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
        })
        setLoading(false)
        return
      }

      const baseRole: UserRole = "member"

      setCurrentRole(baseRole)
      setPermissions(defaultPermissions[baseRole])
    } catch (err: any) {
      console.error("Error fetching user role:", err)
      setError(err.message || "Failed to fetch user role.")
      addNotification({
        id: Date.now(),
        message: `Failed to load user role: ${err.message}`,
        type: "error",
      })
      setCurrentRole("member")
      setPermissions(defaultPermissions.member)
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

  const contextValue = {
    currentRole,
    permissions,
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
