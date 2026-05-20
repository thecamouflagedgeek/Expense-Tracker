"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRole } from "@/contexts/role-context"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export function RoleSwitcher() {
  const { user, loading: authLoading } = useAuth()
  const { currentRole, switchRole, availableRoles, loading: roleLoading } = useRole()

  // Do not render if user is not logged in or still loading
  if (!user || authLoading || roleLoading) {
    return (
      <div className="flex items-center text-black font-semibold text-xs">
        <Loader2 className="h-4 w-4 animate-spin mr-2 text-black" />
        <span className="text-black/60 font-medium">Loading roles...</span>
      </div>
    )
  }

  return (
    <Select value={currentRole} onValueChange={switchRole}>
      <SelectTrigger className="w-[180px] bg-white text-black border border-black/5 hover:bg-black/[0.02] transition-colors rounded-xl text-xs h-10 font-semibold shadow-sm focus:ring-2 focus:ring-black">
        <SelectValue placeholder="Select Role" />
      </SelectTrigger>
      <SelectContent className="bg-white text-black border border-black/5 rounded-2xl shadow-xl">
        {availableRoles.map((role) => (
          <SelectItem key={role} value={role} className="hover:bg-black/[0.04] focus:bg-black/[0.04] text-xs font-semibold rounded-lg my-0.5 cursor-pointer">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
