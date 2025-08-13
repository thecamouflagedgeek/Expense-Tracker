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
      <div className="flex items-center text-[#00ADB5]">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-[#EEEEEE]/70">Loading roles...</span>
      </div>
    )
  }

  return (
    <Select value={currentRole} onValueChange={switchRole}>
      <SelectTrigger className="w-[180px] bg-[#393E46] text-[#EEEEEE] border-[#00ADB5]">
        <SelectValue placeholder="Select Role" />
      </SelectTrigger>
      <SelectContent className="bg-[#222831] text-[#EEEEEE] border-[#00ADB5]">
        {availableRoles.map((role) => (
          <SelectItem key={role} value={role} className="hover:bg-[#393E46] focus:bg-[#393E46]">
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
