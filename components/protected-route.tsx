"use client"

import type React from "C:/Users/Vercel/Desktop/expense-tracker-app/node_modules/@types/react"
import { useAuth } from "@/contexts/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

const publicPaths = ["/login", "/shared/note"] // Add any other public paths here

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If still loading, do nothing and wait for auth state to resolve
    if (loading) {
      return
    }

    // Check if the current path is public
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

    if (!user && !isPublicPath) {
      // If not logged in and trying to access a protected route, redirect to login
      router.push("/login")
    } else if (user && pathname === "/login") {
      // If logged in and trying to access login page, redirect to dashboard
      router.push("/dashboard")
    }
  }, [user, loading, pathname, router])

  // Show a loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#222831] text-[#00ADB5]">
        <Loader2 className="h-12 w-12 animate-spin" />
        <span className="sr-only">Loading application...</span>
      </div>
    )
  }

  // Render children only if user is authenticated or if it's a public path
  if (user || publicPaths.some((path) => pathname.startsWith(path))) {
    return <>{children}</>
  }

  // Otherwise, return null (or a minimal loading state) as redirect is handled by useEffect
  return null
}
