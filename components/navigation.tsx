"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useRole } from "@/contexts/role-context"
import { Home, DollarSign, NotebookPen, Archive, Users, LogOut, ReceiptText } from "lucide-react"

export function Navigation() {
  const { user, logout, loading } = useAuth()
  const { permissions } = useRole()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Don't render navigation on login page or if user is not loaded yet
  if (pathname === "/login" || loading) {
    return null
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home, show: permissions.canViewDashboard },
    { name: "Transactions", href: "/transactions", icon: DollarSign, show: permissions.canViewTransactions },
    { name: "Receipts", href: "/receipts", icon: ReceiptText, show: permissions.canViewReceipts },
    { name: "Notes", href: "/notes", icon: NotebookPen, show: permissions.canViewNotes },
    { name: "Archive", href: "/archive", icon: Archive, show: permissions.canArchiveTransactions || permissions.canArchiveNotes },
    { name: "Admin Hub", href: "/admin", icon: Users, show: permissions.canAccessAdminHub },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-[#222831] text-[#EEEEEE] p-4 border-b border-[#393E46] shadow-lg flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image src="/ctrlfund-logo.png" alt="CtrlFund Logo" width={40} height={40} priority />
          <span className="text-2xl font-bold text-[#00ADB5] hidden md:block">CtrlFund</span>
        </Link>
        <div className="hidden md:flex space-x-2">
          {navItems.map((item) =>
            item.show ? (
              <Button
                key={item.name}
                asChild
                variant="ghost"
                className={`text-[#EEEEEE] hover:bg-[#00ADB5]/20 hover:text-[#00ADB5] ${
                  pathname === item.href ? "bg-[#00ADB5]/30 text-[#00ADB5]" : ""
                }`}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            ) : null,
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {user && (
          <>
            <div className="flex items-center space-x-3 text-[#EEEEEE]">
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-[#00ADB5]">{user.role}</div>
              </div>
              <div className="w-8 h-8 bg-[#00ADB5] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-slate-600 text-[#EEEEEE] hover:bg-[#00ADB5]/20 hover:text-[#00ADB5] bg-transparent border-[#393E46]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}
