"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useRole } from "@/contexts/role-context"
import { useNotification } from "@/contexts/notification-context"
import { useCurrency, SUPPORTED_CURRENCIES, type CurrencyCode } from "@/context/currency-context"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  Home, 
  CreditCard, 
  FileText, 
  Settings, 
  Bell, 
  FileDown, 
  LogOut, 
  ChevronDown,
  Globe
} from "lucide-react"

export function Navigation() {
  const { user, logout, loading } = useAuth()
  const { permissions } = useRole()
  const { addNotification } = useNotification()
  const { currency, setCurrency } = useCurrency()
  const pathname = usePathname()
  const router = useRouter()

  // Don't render navigation on login page or if loading
  if (pathname === "/login" || loading) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleSettingsAction = (label: string) => {
    addNotification({
      message: `${label} is coming soon.`,
      type: "info",
    })
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home, show: permissions.canViewDashboard },
    { name: "Transactions", href: "/transactions", icon: CreditCard, show: permissions.canViewTransactions },
    { name: "Notes", href: "/notes", icon: FileText, show: permissions.canViewNotes },
  ]

  // Get Page Title based on route
  const getPageTitle = () => {
    if (pathname.startsWith("/transactions")) return "Finance"
    if (pathname.startsWith("/notes")) return "Notes"
    return "Dashboard"
  }

  // Currency groups for the dropdown
  const currencyGroups = [
    {
      label: "🌍 Major Global",
      codes: ["INR", "USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY"] as CurrencyCode[],
    },
    {
      label: "🗺️ Middle East & Asia-Pacific",
      codes: ["AED", "SAR", "SGD", "HKD", "KRW", "NZD"] as CurrencyCode[],
    },
    {
      label: "📈 Regional & Noteworthy",
      codes: ["RUB", "ZAR", "BRL", "TRY"] as CurrencyCode[],
    },
  ]

  return (
    <>
      {/* 1. FLOATING SIDEBAR (Desktop only) */}
      <aside className="fixed top-4 left-4 bottom-4 w-20 bg-[#0c0d0e] rounded-[24px] shadow-2xl flex-col items-center py-6 justify-between z-50 hidden md:flex border border-white/5">
        <div className="flex flex-col items-center gap-10 w-full">
          {/* Circular Double-Ring Electric Lime Logo */}
          <Link href="/dashboard" className="relative group">
            <div className="w-12 h-12 rounded-full border-2 border-[#ccff00] flex items-center justify-center bg-black/40 group-hover:scale-105 transition-transform duration-300">
              <div className="w-8 h-8 rounded-full border border-dashed border-[#ccff00]/60 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[#ccff00] shadow-[0_0_10px_#ccff00]" />
              </div>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-6 w-full px-2">
            {navItems.map((item) => {
              if (!item.show) return null
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href} className="relative group flex justify-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                    isActive 
                      ? "bg-white/10 text-[#ccff00]" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  {/* Tooltip */}
                  <span className="absolute left-20 bg-[#0c0d0e] text-[#ccff00] text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-xl border border-white/5 whitespace-nowrap z-50">
                    {item.name}
                  </span>
                </Link>
              )
            })}

          </nav>
        </div>

        {/* Bottom Messages / Settings */}
        <div className="flex flex-col gap-4 w-full items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-12 h-12 rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 transition-all relative group">
                <Settings className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#0c0d0e] border-white/10 text-white rounded-xl shadow-2xl ml-4">
              <DropdownMenuLabel className="text-[#ccff00] text-xs font-bold uppercase tracking-wider">Workspace</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              {user && (
                <div className="px-2 py-1.5 text-xs text-white/50">
                  Logged in as: <strong className="text-white block">{user.name}</strong>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* 2a. DESKTOP PREMIUM HORIZONTAL TOPBAR LAYOUT (hidden md:flex) */}
      <header className="hidden md:flex fixed top-0 left-0 right-0 h-20 z-40 bg-[#eff1e9]/80 backdrop-blur-md border-b border-black/5 items-center justify-between px-12 pl-28 transition-all">
        {/* Page Title & Currency Dropdown */}
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black tracking-tight text-[#0c0d0e]">
            {getPageTitle()}
          </h1>

          {/* Global Currency Selection Toggler - grouped by region */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white hover:bg-black/5 border-black/5 text-[#0c0d0e] font-semibold rounded-full shadow-sm flex items-center gap-1 text-xs px-4"
              >
                <Globe className="w-3.5 h-3.5 opacity-55" />
                <span>{SUPPORTED_CURRENCIES[currency].label}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-55" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-black/5 text-[#0c0d0e] rounded-xl shadow-xl z-50 max-h-[70vh] overflow-y-auto w-52">
              {currencyGroups.map((group) => (
                <div key={group.label}>
                  <DropdownMenuLabel className="text-black/40 text-[9px] font-black uppercase tracking-wider px-3 pt-3 pb-1">
                    {group.label}
                  </DropdownMenuLabel>
                  {group.codes.map((code) => {
                    const item = SUPPORTED_CURRENCIES[code]
                    return (
                      <DropdownMenuItem
                        key={code}
                        onClick={() => setCurrency(code)}
                        className={`hover:bg-[#ccff00]/15 hover:text-black font-medium cursor-pointer text-xs px-3 py-2 flex items-center justify-between gap-2 ${
                          currency === code ? "bg-[#ccff00]/25 font-bold text-black" : ""
                        }`}
                      >
                        <span>{item.label}</span>
                        {currency === code && <span className="text-[9px] font-black text-black bg-[#ccff00] px-1.5 py-0.5 rounded-full">Active</span>}
                      </DropdownMenuItem>
                    )
                  })}
                  <DropdownMenuSeparator className="bg-black/5" />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Header Actions: Notification panel trigger, mock exports, and User profile */}
        <div className="flex items-center gap-4">
          {/* Notification Bell Icon */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 rounded-full bg-white hover:bg-black/5 flex items-center justify-center text-[#0c0d0e] shadow-sm relative transition-all duration-200 border border-black/5">
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-black/5 text-[#0c0d0e] rounded-xl shadow-2xl w-80 mr-2 z-50">
              <DropdownMenuLabel className="text-[#0c0d0e] text-xs font-bold px-3 py-2">Recent Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-black/5" />
              <div className="max-h-60 overflow-y-auto px-1 py-1">
                <div className="p-3 text-xs border-b border-black/5 hover:bg-black/5 transition rounded-lg">
                  <p className="font-semibold text-black">Seeded default mockups</p>
                  <p className="text-black/60 mt-0.5">Paypal, Twitch, and Airbnb transactions populated in {currency}</p>
                </div>
                <div className="p-3 text-xs border-b border-black/5 hover:bg-black/5 transition rounded-lg">
                  <p className="font-semibold text-black">{user?.name || "User"} logged in</p>
                  <p className="text-black/60 mt-0.5">Successful login to the workspace</p>
                </div>
                <div className="p-3 text-xs hover:bg-black/5 transition rounded-lg">
                  <p className="font-semibold text-black">Active Currency Set</p>
                  <p className="text-black/60 mt-0.5">Amounts mapped dynamically to {currency} ({SUPPORTED_CURRENCIES[currency].symbol})</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Backup/Export Icon (Mock dropdown selector) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-10 h-10 rounded-full bg-white hover:bg-black/5 flex items-center justify-center text-[#0c0d0e] shadow-sm transition-all duration-200 border border-black/5">
                <FileDown className="w-4.5 h-4.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-black/5 text-[#0c0d0e] rounded-xl shadow-xl w-48 mr-2 z-50">
              <DropdownMenuLabel className="text-[10px] font-bold text-black/45 uppercase tracking-wider px-3">Export utilities</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-black/5" />
              <DropdownMenuItem onClick={() => router.push("/dashboard")} className="text-xs py-2 px-3 cursor-pointer hover:bg-black/5">
                Go to Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/transactions")} className="text-xs py-2 px-3 cursor-pointer hover:bg-black/5">
                Finance Hub
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/notes")} className="text-xs py-2 px-3 cursor-pointer hover:bg-black/5">
                Export Notes to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Badge (Joseph Mitchell) */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-3 pr-2 py-1 rounded-full bg-white hover:bg-black/5 shadow-sm transition-all duration-200 border border-black/5 cursor-pointer">
                  <span className="text-xs font-bold text-[#0c0d0e] hidden md:inline">
                    {user.name}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#ccff00] text-black font-black text-xs flex items-center justify-center shadow-inner">
                    {user.name?.split(" ").map(w => w.charAt(0)).join("") || "JM"}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-black/5 text-[#0c0d0e] rounded-xl shadow-2xl w-56 mr-2 z-50">
                <DropdownMenuLabel className="font-bold">{user.name}</DropdownMenuLabel>
                <div className="px-3 pb-2 text-[10px] text-black/50 truncate">{user.email}</div>
                <DropdownMenuSeparator className="bg-black/5" />
                
                <DropdownMenuSeparator className="bg-black/5" />
                
                <DropdownMenuItem 
                  onClick={() => router.push("/dashboard")}
                  className="text-xs py-2 px-3 cursor-pointer hover:bg-black/5"
                >
                  <Home className="w-3.5 h-3.5 mr-2 opacity-70" /> Dashboard Overview
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-xs py-2 px-3 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* 2b. MOBILE PREMIUM HORIZONTAL TOPBAR LAYOUT (md:hidden flex) */}
      <header className="md:hidden flex fixed top-0 left-0 right-0 h-20 z-40 bg-[#eff1e9]/80 backdrop-blur-md border-b border-black/5 items-center justify-between px-6 transition-all">
        {/* Page Title & Currency Dropdown */}
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black tracking-tight text-[#0c0d0e] truncate max-w-[130px]">
            {getPageTitle()}
          </h1>

          {/* Global Currency Selection Toggler - grouped by region */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white hover:bg-black/5 border-black/5 text-[#0c0d0e] font-semibold rounded-full shadow-sm flex items-center gap-1 text-[10px] px-3 h-8"
              >
                <Globe className="w-3 h-3 opacity-55" />
                <span>{SUPPORTED_CURRENCIES[currency].symbol}</span>
                <ChevronDown className="w-3 h-3 opacity-55" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-black/5 text-[#0c0d0e] rounded-xl shadow-xl z-50 max-h-[70vh] overflow-y-auto w-52">
              {currencyGroups.map((group) => (
                <div key={group.label}>
                  <DropdownMenuLabel className="text-black/40 text-[9px] font-black uppercase tracking-wider px-3 pt-3 pb-1">
                    {group.label}
                  </DropdownMenuLabel>
                  {group.codes.map((code) => {
                    const item = SUPPORTED_CURRENCIES[code]
                    return (
                      <DropdownMenuItem
                        key={code}
                        onClick={() => setCurrency(code)}
                        className={`hover:bg-[#ccff00]/15 hover:text-black font-medium cursor-pointer text-xs px-3 py-2 flex items-center justify-between gap-2 ${
                          currency === code ? "bg-[#ccff00]/25 font-bold text-black" : ""
                        }`}
                      >
                        <span>{item.label}</span>
                        {currency === code && <span className="text-[9px] font-black text-black bg-[#ccff00] px-1.5 py-0.5 rounded-full">Active</span>}
                      </DropdownMenuItem>
                    )
                  })}
                  <DropdownMenuSeparator className="bg-black/5" />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Header Actions: Notification panel trigger, mock exports, and User profile */}
        <div className="flex items-center gap-2">
          {/* Notification Bell Icon */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-white hover:bg-black/5 flex items-center justify-center text-[#0c0d0e] shadow-sm relative transition-all duration-200 border border-black/5">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-black/5 text-[#0c0d0e] rounded-xl shadow-2xl w-80 mr-2 z-50">
              <DropdownMenuLabel className="text-[#0c0d0e] text-xs font-bold px-3 py-2">Recent Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-black/5" />
              <div className="max-h-60 overflow-y-auto px-1 py-1">
                <div className="p-3 text-xs border-b border-black/5 hover:bg-black/5 transition rounded-lg">
                  <p className="font-semibold text-black">Seeded default mockups</p>
                  <p className="text-black/60 mt-0.5">Paypal, Twitch, and Airbnb transactions populated in {currency}</p>
                </div>
                <div className="p-3 text-xs border-b border-black/5 hover:bg-black/5 transition rounded-lg">
                  <p className="font-semibold text-black">{user?.name || "User"} logged in</p>
                  <p className="text-black/60 mt-0.5">Successful login to the workspace</p>
                </div>
                <div className="p-3 text-xs hover:bg-black/5 transition rounded-lg">
                  <p className="font-semibold text-black">Active Currency Set</p>
                  <p className="text-black/60 mt-0.5">Amounts mapped dynamically to {currency} ({SUPPORTED_CURRENCIES[currency].symbol})</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Backup/Export Icon (Mock dropdown selector) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-9 h-9 rounded-full bg-white hover:bg-black/5 flex items-center justify-center text-[#0c0d0e] shadow-sm transition-all duration-200 border border-black/5">
                <FileDown className="w-4.5 h-4.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border-black/5 text-[#0c0d0e] rounded-xl shadow-xl w-48 mr-2 z-50">
              <DropdownMenuLabel className="text-[10px] font-bold text-black/45 uppercase tracking-wider px-3">Export utilities</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-black/5" />
              <DropdownMenuItem onClick={() => router.push("/dashboard")} className="text-xs py-2 px-3 cursor-pointer hover:bg-black/5">
                Go to Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/transactions")} className="text-xs py-2 px-3 cursor-pointer hover:bg-black/5">
                Finance Hub
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/notes")} className="text-xs py-2 px-3 cursor-pointer hover:bg-black/5">
                Export Notes to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Badge (Joseph Mitchell) */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1.5 p-1 rounded-full bg-white hover:bg-black/5 shadow-sm transition-all duration-200 border border-black/5 cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-[#ccff00] text-black font-black text-xs flex items-center justify-center shadow-inner">
                    {user.name?.split(" ").map(w => w.charAt(0)).join("") || "JM"}
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-black/5 text-[#0c0d0e] rounded-xl shadow-2xl w-56 mr-2 z-50">
                <DropdownMenuLabel className="font-bold">{user.name}</DropdownMenuLabel>
                <div className="px-3 pb-2 text-[10px] text-black/50 truncate">{user.email}</div>
                <DropdownMenuSeparator className="bg-black/5" />
                
                <DropdownMenuSeparator className="bg-black/5" />
                
                <DropdownMenuItem 
                  onClick={() => router.push("/dashboard")}
                  className="text-xs py-2 px-3 cursor-pointer hover:bg-black/5"
                >
                  <Home className="w-3.5 h-3.5 mr-2 opacity-70" /> Dashboard Overview
                </DropdownMenuItem>

                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-xs py-2 px-3 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (unique pill-style floating nav) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-0">
        <div className="bg-[#0c0d0e]/95 backdrop-blur-xl border border-white/10 rounded-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.35)] flex items-center justify-around px-2 py-2">
          {navItems.filter(i => i.show).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-5 py-2.5 rounded-[20px] transition-all duration-300 ${
                  isActive
                    ? "bg-[#ccff00] text-black"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-black" : ""}`} />
                <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? "text-black" : ""}`}>
                  {item.name}
                </span>
              </Link>
            )
          })}

          {/* Mobile settings menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-[20px] text-white/50 hover:text-white transition-all">
                <Settings className="w-5 h-5" />
                <span className="text-[9px] font-black uppercase tracking-wider">Settings</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              className="bg-[#0c0d0e] border-white/10 text-white rounded-2xl shadow-2xl mb-2 w-56"
            >
              <DropdownMenuLabel className="text-white text-[10px] font-bold uppercase tracking-wider px-3 py-2">
                Settings
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => handleSettingsAction("Profile settings")}
                className="text-xs py-2 px-3 cursor-pointer text-white/80 hover:bg-white/10"
              >
                Profile settings
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSettingsAction("Preferences")}
                className="text-xs py-2 px-3 cursor-pointer text-white/80 hover:bg-white/10"
              >
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSettingsAction("Theme options")}
                className="text-xs py-2 px-3 cursor-pointer text-white/80 hover:bg-white/10"
              >
                Theme options
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-xs py-2 px-3 cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-400 font-semibold"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile user menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex flex-col items-center gap-1 px-4 py-2.5 rounded-[20px] text-white/50 hover:text-white transition-all">
                  <div className="w-5 h-5 rounded-full bg-[#ccff00] text-black text-[8px] font-black flex items-center justify-center">
                    {user.name?.split(" ").map(w => w.charAt(0)).join("") || "JM"}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider">You</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="bg-[#0c0d0e] border-white/10 text-white rounded-2xl shadow-2xl mb-2 w-52"
              >
                <DropdownMenuLabel className="text-white font-bold">{user.name}</DropdownMenuLabel>
                <div className="px-3 pb-2 text-[10px] text-white/40 truncate">{user.email}</div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuSeparator className="bg-white/10" />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>
    </>
  )
}
