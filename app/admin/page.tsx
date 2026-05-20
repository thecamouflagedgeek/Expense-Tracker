"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useRole } from "@/contexts/role-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Search, Users, UserCheck, UserX, ShieldAlert } from "lucide-react"

export default function AdminPage() {
  const { permissions } = useRole()
  const { users, updateUserStatus, updateUserRole, deleteUser, activityLog, loading } = useAuth()
  const [query, setQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleDeleteUser = async () => {
    if (!confirmDeleteId) return
    await deleteUser(confirmDeleteId)
    setConfirmDeleteId(null)
  }

  const summary = useMemo(() => {
    const total = users.length
    const active = users.filter((u) => u.isActive).length
    const pending = users.filter((u) => !u.isActive).length
    return { total, active, pending }
  }, [users])

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false
      if (statusFilter !== "all" && String(u.isActive) !== statusFilter) return false
      const q = query.toLowerCase()
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      )
    })
  }, [users, roleFilter, statusFilter, query])

  if (!permissions.canAccessAdminHub) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#eff1e9] text-black">
        <div className="text-center p-8 bg-white border border-black/5 rounded-3xl shadow-xl max-w-md">
          <h2 className="text-2xl font-black text-red-500 mb-2">Access Denied</h2>
          <p className="text-black/60 text-sm">You do not have permission to access the Admin Hub.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black">Admin Hub</h1>
          <p className="text-xs text-black/50 font-semibold">Manage users, access, and system activity.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card className="card-gradient border-none p-5">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-xs font-bold text-black/50 uppercase">Total Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex items-center gap-3">
            <Users className="w-5 h-5 text-black/50" />
            <span className="text-2xl font-black text-black">{summary.total}</span>
          </CardContent>
        </Card>
        <Card className="card-gradient border-none p-5">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-xs font-bold text-black/50 uppercase">Active</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <span className="text-2xl font-black text-black">{summary.active}</span>
          </CardContent>
        </Card>
        <Card className="card-gradient border-none p-5">
          <CardHeader className="p-0 mb-2">
            <CardTitle className="text-xs font-bold text-black/50 uppercase">Pending</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex items-center gap-3">
            <UserX className="w-5 h-5 text-orange-500" />
            <span className="text-2xl font-black text-black">{summary.pending}</span>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="pl-9 bg-white text-black border border-black/5 hover:bg-black/[0.02] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 font-semibold shadow-sm placeholder:text-black/30"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-white text-black border border-black/5 hover:bg-black/[0.02] transition-colors rounded-xl text-xs h-10 font-semibold shadow-sm focus:ring-2 focus:ring-black">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black border border-black/5 rounded-2xl shadow-xl">
            <SelectItem value="all" className="text-xs font-semibold">All Roles</SelectItem>
            <SelectItem value="admin" className="text-xs font-semibold">Admin</SelectItem>
            <SelectItem value="member" className="text-xs font-semibold">Member</SelectItem>
            <SelectItem value="viewer" className="text-xs font-semibold">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px] bg-white text-black border border-black/5 hover:bg-black/[0.02] transition-colors rounded-xl text-xs h-10 font-semibold shadow-sm focus:ring-2 focus:ring-black">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-white text-black border border-black/5 rounded-2xl shadow-xl">
            <SelectItem value="all" className="text-xs font-semibold">All Statuses</SelectItem>
            <SelectItem value="true" className="text-xs font-semibold">Active</SelectItem>
            <SelectItem value="false" className="text-xs font-semibold">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="card-gradient border-none p-6 mb-8">
        <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold text-black tracking-tight">User Management</CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
          {loading ? (
            <div className="text-center text-black/45 font-semibold py-12 bg-white border border-black/5 rounded-2xl">
              <p className="text-sm font-bold">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center text-black/45 font-semibold py-12 bg-white border border-black/5 rounded-2xl">
              <ShieldAlert className="w-8 h-8 text-black/30 mx-auto mb-3" />
              <p className="text-sm font-bold">No users match your filters.</p>
              <p className="text-xs text-black/40 mt-1">Adjust search or filters to find users.</p>
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-white border border-black/5 rounded-2xl"
              >
                <div>
                  <p className="text-sm font-bold text-black">{u.name}</p>
                  <p className="text-[10px] text-black/45 font-semibold">{u.email}</p>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <Select value={u.role} onValueChange={(value) => updateUserRole(u.id, value as "admin" | "member" | "viewer")}>
                    <SelectTrigger className="w-full md:w-[160px] bg-white text-black border border-black/5 hover:bg-black/[0.02] transition-colors rounded-xl text-xs h-9 font-semibold shadow-sm focus:ring-2 focus:ring-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black border border-black/5 rounded-2xl shadow-xl">
                      <SelectItem value="admin" className="text-xs font-semibold">Admin</SelectItem>
                      <SelectItem value="member" className="text-xs font-semibold">Member</SelectItem>
                      <SelectItem value="viewer" className="text-xs font-semibold">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="h-9 text-xs"
                    onClick={() => updateUserStatus(u.id, !u.isActive)}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-9 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setConfirmDeleteId(u.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="card-gradient border-none p-6">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-base font-bold text-black tracking-tight">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {activityLog.length === 0 ? (
            <Alert className="bg-white border border-black/5 rounded-2xl">
              <AlertTitle className="text-sm font-bold">No recent activity yet.</AlertTitle>
              <AlertDescription className="text-xs text-black/45">
                Activity will appear once users log in, update roles, or perform actions.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {activityLog.slice(0, 8).map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 bg-white border border-black/5 rounded-2xl"
                >
                  <div>
                    <p className="text-xs font-bold text-black">{entry.type.replace(/_/g, " ")}</p>
                    <p className="text-[10px] text-black/45 font-semibold">{entry.email || entry.userId || "System"}</p>
                  </div>
                  <span className="text-[10px] text-black/40 font-semibold">{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(confirmDeleteId)} onOpenChange={() => setConfirmDeleteId(null)}>
        <AlertDialogContent className="bg-white text-black border border-black/5 rounded-3xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black">Remove user?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-black/60">
              This removes the user permanently. Their data remains but they will lose access immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
              onClick={handleDeleteUser}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
