"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRole } from "@/contexts/role-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

const publicPaths = ["/login", "/shared/note", "/receipt-upload/"]

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const { loading: roleLoading } = useRole()
  const router = useRouter()
  const pathname = usePathname()
  const isPublicPath = pathname === "/" || publicPaths.some((path) => pathname.startsWith(path))

  useEffect(() => {
    if (loading || roleLoading) {
      return
    }

    if (!user && !isPublicPath) {
      router.replace("/")
    } else if (user && pathname === "/") {
      router.replace("/dashboard")
    }
  }, [user, loading, roleLoading, isPublicPath, pathname, router])

  if (isPublicPath) {
    return <>{children}</>
  }

  if (loading || roleLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen grid-bg-pattern text-black">
        <Loader2 className="h-10 w-10 animate-spin text-black stroke-[3]" />
        <span className="sr-only">Loading application...</span>
      </div>
    )
  }

  if (user) {
    return <>{children}</>
  }

  return null
}
