"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Loader2 } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen grid-bg-pattern text-black">
      <Loader2 className="h-10 w-10 animate-spin text-black stroke-[3]" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
