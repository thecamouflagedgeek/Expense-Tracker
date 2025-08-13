"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useRole } from "@/contexts/role-context"
import { Loader2, Search, Trash2, Shield, Users, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import type { User } from "@/contexts/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminPage() {
  const {
    users,
    loading,
    error,
    updateUserStatus,
    updateUserPermissions,
    updateUserRole,
    deleteUser,
    user: currentUser,
  } = useAuth()
  const { permissions } = useRole()
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [users, searchTerm])

  const pendingUsers = useMemo(() => {
    return users.filter((user) => !user.isActive)
  }, [users])

  const activeUsers = useMemo(() => {
    return users.filter((user) => user.isActive)
  }, [users])

  const isMainAdmin = currentUser?.email === "admin@ctrlfund.com"

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    setUpdatingUserId(userId)
    try {
      await updateUserStatus(userId, !currentStatus)
    } catch (err) {
      console.error("Failed to update user status:", err)
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handlePermissionToggle = async (userId: string, permissionKey: keyof User["customPermissions"]) => {
    setUpdatingUserId(userId)
    try {
      const userToUpdate = users.find((u) => u.id === userId)
      if (userToUpdate) {
        const newPermissions = {
          ...userToUpdate.customPermissions,
          [permissionKey]: !userToUpdate.customPermissions?.[permissionKey],
        }
        await updateUserPermissions(userId, newPermissions)
      }
    } catch (err) {
      console.error("Failed to update user permission:", err)
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    setDeletingUserId(userId)
    try {
      await deleteUser(userId)
    } catch (err) {
      console.error("Failed to delete user:", err)
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleRoleChange = async (userId: string, newRole: "admin" | "member") => {
    setUpdatingUserId(userId)
    try {
      await updateUserRole(userId, newRole)
    } catch (err) {
      console.error("Failed to update user role:", err)
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (!permissions.canAccessAdminHub) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#222831] text-[#EEEEEE]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-[#EEEEEE]/70">You do not have permission to access the Admin Hub.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 mt-16"
    >
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-[#00ADB5]">Admin Hub</h1>
        {isMainAdmin && (
          <Badge variant="outline" className="border-[#00ADB5] text-[#00ADB5] bg-[#00ADB5]/10">
            <Shield className="w-4 h-4 mr-1" />
            Main Admin
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#EEEEEE]/80">Total Users</CardTitle>
              <Users className="h-4 w-4 text-[#00ADB5]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#EEEEEE]">{users.length}</div>
              <p className="text-xs text-[#EEEEEE]/60">Registered accounts</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#EEEEEE]/80">Active Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#EEEEEE]">{activeUsers.length}</div>
              <p className="text-xs text-[#EEEEEE]/60">Currently active</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="stats-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#EEEEEE]/80">Pending Approval</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-[#393E46]/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                      <div>
                        <p className="font-medium text-[#EEEEEE]">{user.name}</p>
                        <p className="text-sm text-[#EEEEEE]/60">{user.email}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {user.role === "admin" ? "Admin" : "Department User"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusToggle(user.id, user.isActive)}
                        disabled={updatingUserId === user.id}
                        className="button-gradient"
                      >
                        {updatingUserId === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      {isMainAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500 text-red-400 hover:bg-red-500/20 bg-transparent"
                              disabled={deletingUserId === user.id}
                            >
                              {deletingUserId === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </>
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#222831] border-[#393E46]">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-[#EEEEEE]">Reject Account</AlertDialogTitle>
                              <AlertDialogDescription className="text-[#EEEEEE]/70">
                                Are you sure you want to reject and delete {user.name}'s account? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-[#393E46] text-[#EEEEEE] border-[#393E46]">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Reject & Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {pendingUsers.length > 0 && (
        <Card className="card-gradient border-orange-500/30 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-orange-400 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Pending Account Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-[#393E46]/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    <div>
                      <p className="font-medium text-[#EEEEEE]">{user.name}</p>
                      <p className="text-sm text-[#EEEEEE]/60">{user.email}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {user.role === "admin" ? "Admin" : "Department User"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusToggle(user.id, user.isActive)}
                      disabled={updatingUserId === user.id}
                      className="button-gradient"
                    >
                      {updatingUserId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    {isMainAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-400 hover:bg-red-500/20 bg-transparent"
                            disabled={deletingUserId === user.id}
                          >
                            {deletingUserId === user.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#222831] border-[#393E46]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-[#EEEEEE]">Reject Account</AlertDialogTitle>
                            <AlertDialogDescription className="text-[#EEEEEE]/70">
                              Are you sure you want to reject and delete {user.name}'s account? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-[#393E46] text-[#EEEEEE] border-[#393E46]">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Reject & Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="card-gradient border-[#393E46] mb-8">
        <CardHeader>
          <CardTitle className="text-xl text-[#00ADB5]">User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] focus:ring-[#00ADB5]"
            />
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#00ADB5]" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[200px] text-[#00ADB5]">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="sr-only">Loading users...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="bg-red-900/20 border-red-700 text-red-400">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center text-[#EEEEEE]/70">
              <p>No users found matching your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#393E46]">
                    <TableHead className="text-[#00ADB5]">User</TableHead>
                    <TableHead className="text-[#00ADB5]">Role</TableHead>
                    <TableHead className="text-[#00ADB5] text-center">Status</TableHead>
                    <TableHead className="text-[#00ADB5] text-center">Edit Transactions</TableHead>
                    <TableHead className="text-[#00ADB5] text-center">Upload Receipts</TableHead>
                    <TableHead className="text-[#00ADB5] text-center">Edit Notes</TableHead>
                    {isMainAdmin && <TableHead className="text-[#00ADB5] text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-[#393E46] hover:bg-[#393E46]/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-orange-500"}`} />
                          <div>
                            <p className="font-medium text-[#EEEEEE]">{user.name}</p>
                            <p className="text-sm text-[#EEEEEE]/60">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isMainAdmin && user.email !== "admin@ctrlfund.com" ? (
                          <Select
                            value={user.role}
                            onValueChange={(value: "admin" | "member") => handleRoleChange(user.id, value)}
                            disabled={updatingUserId === user.id}
                          >
                            <SelectTrigger className="w-[140px] bg-[#393E46] border-[#00ADB5] text-[#EEEEEE]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#393E46] border-[#00ADB5]">
                              <SelectItem value="admin" className="text-[#EEEEEE] focus:bg-[#00ADB5]/20">
                                Admin
                              </SelectItem>
                              <SelectItem value="member" className="text-[#EEEEEE] focus:bg-[#00ADB5]/20">
                                Department User
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge
                            variant="outline"
                            className={
                              user.role === "admin"
                                ? "border-[#00ADB5] text-[#00ADB5]"
                                : "border-[#EEEEEE]/30 text-[#EEEEEE]/80"
                            }
                          >
                            {user.role === "admin" ? "Admin" : user.role === "member" ? "Department User" : "Viewer"}
                            {user.email === "admin@ctrlfund.com" && " (Main)"}
                          </Badge>
                        )}
                        {updatingUserId === user.id && (
                          <Loader2 className="h-4 w-4 animate-spin inline-block ml-2 text-[#00ADB5]" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={user.isActive}
                          onCheckedChange={() => handleStatusToggle(user.id, user.isActive)}
                          disabled={updatingUserId === user.id}
                        />
                        {updatingUserId === user.id && (
                          <Loader2 className="h-4 w-4 animate-spin inline-block ml-2 text-[#00ADB5]" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={user.customPermissions?.canEditTransactions ?? false}
                          onCheckedChange={() => handlePermissionToggle(user.id, "canEditTransactions")}
                          disabled={updatingUserId === user.id}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={user.customPermissions?.canUploadReceipts ?? false}
                          onCheckedChange={() => handlePermissionToggle(user.id, "canUploadReceipts")}
                          disabled={updatingUserId === user.id}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={user.customPermissions?.canEditNotes ?? false}
                          onCheckedChange={() => handlePermissionToggle(user.id, "canEditNotes")}
                          disabled={updatingUserId === user.id}
                        />
                      </TableCell>
                      {isMainAdmin && (
                        <TableCell className="text-center">
                          {user.email !== "admin@ctrlfund.com" ? (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500 text-red-400 hover:bg-red-500/20 bg-transparent"
                                  disabled={deletingUserId === user.id}
                                >
                                  {deletingUserId === user.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-[#222831] border-[#393E46]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-[#EEEEEE]">Delete User Account</AlertDialogTitle>
                                  <AlertDialogDescription className="text-[#EEEEEE]/70">
                                    Are you sure you want to delete {user.name}'s account? This action cannot be undone
                                    and will remove all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-[#393E46] text-[#EEEEEE] border-[#393E46]">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete Account
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          ) : (
                            <Badge variant="outline" className="border-[#00ADB5] text-[#00ADB5] text-xs">
                              Protected
                            </Badge>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
