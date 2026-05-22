"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useNotification } from "@/contexts/notification-context"
import { Loader2, Sparkles } from "lucide-react"
import { useState } from "react"

export function UploadSponsorshipButton() {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [loading, setLoading] = useState(false)

  const handleSponsorshipUpload = async () => {
    if (!user) {
      addNotification({
        id: Date.now(),
        message: "You must be logged in to upload sponsorship documents.",
        type: "error",
      })
      return
    }

    setLoading(true)
    try {
      // Simulate API call for uploading sponsorship documents
      await new Promise((resolve) => setTimeout(resolve, 2000))
      addNotification({
        id: Date.now(),
        message: "Sponsorship documents uploaded successfully!",
        type: "success",
      })
    } catch (error: any) {
      addNotification({
        id: Date.now(),
        message: `Failed to upload sponsorship documents: ${error.message}`,
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleSponsorshipUpload} className="button-gradient" disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" /> Upload Sponsorship
        </>
      )}
    </Button>
  )
}
