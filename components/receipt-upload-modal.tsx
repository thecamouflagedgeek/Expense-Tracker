"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, UploadCloud } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useNotification } from "@/contexts/notification-context"

const LOCAL_STORAGE_RECEIPTS_KEY = "ctrlfund_receipts"

type Receipt = {
  id: string
  userId: string
  fileName: string
  fileType: string
  fileSize: number
  description: string
  uploadedAt: string
  fileData: string // Base64 encoded file data for local storage
}

export function ReceiptUploadModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user } = useAuth()
  const { addNotification } = useNotification()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!user) {
      setError("You must be logged in to upload receipts.")
      setLoading(false)
      return
    }

    if (!file) {
      setError("Please select a file to upload.")
      setLoading(false)
      return
    }

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Convert file to base64 for localStorage
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const newReceipt: Receipt = {
        id: crypto.randomUUID(),
        userId: user.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        description,
        uploadedAt: new Date().toISOString(),
        fileData,
      }

      // Save to localStorage
      const existingReceipts = JSON.parse(localStorage.getItem(LOCAL_STORAGE_RECEIPTS_KEY) || "[]")
      const updatedReceipts = [...existingReceipts, newReceipt]
      localStorage.setItem(LOCAL_STORAGE_RECEIPTS_KEY, JSON.stringify(updatedReceipts))

      addNotification({
        id: Date.now(),
        message: `Receipt "${file.name}" uploaded successfully!`,
        type: "success",
      })

      setIsOpen(false)
      setFile(null)
      setDescription("")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err: any) {
      console.error("Error uploading receipt:", err)
      setError(err.message || "Failed to upload receipt.")
      addNotification({
        id: Date.now(),
        message: `Failed to upload receipt: ${err.message}`,
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="button-gradient">
          <UploadCloud className="mr-2 h-4 w-4" /> Upload Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#222831] text-[#EEEEEE] border-[#00ADB5]">
        <DialogHeader>
          <DialogTitle className="text-[#00ADB5]">Upload Receipt</DialogTitle>
          <DialogDescription className="text-[#EEEEEE]/70">Upload an image or PDF of your receipt.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right text-[#EEEEEE]">
                File
              </Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="col-span-3 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] file:text-[#00ADB5] file:bg-[#393E46] file:border-[#00ADB5] file:border file:rounded-md file:px-3 file:py-1 file:mr-2"
                accept="image/*,.pdf"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-[#EEEEEE]">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5]"
                placeholder="Optional description"
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-700 text-red-400">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="submit" className="button-gradient" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                </>
              ) : (
                "Upload"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
