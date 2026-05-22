"use client"

import type React from "react"

import { useState } from "react"
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
import { Loader2, FolderUp } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useNotification } from "@/contexts/notification-context"

const LOCAL_STORAGE_DRIVE_UPLOADS_KEY = "ctrlfund_drive_uploads"

export function UploadDriveModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [folderName, setFolderName] = useState("CtrlFund Receipts")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setError("You must be logged in to upload files.")
      setLoading(false)
      return
    }

    if (!file) {
      setError("Please select a file to upload.")
      setLoading(false)
      return
    }

    try {
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const existingUploads = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DRIVE_UPLOADS_KEY) || "[]")
      const newUpload = {
        id: crypto.randomUUID(),
        userId: user.id,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        folderName,
        uploadedAt: new Date().toISOString(),
        fileData,
      }
      localStorage.setItem(LOCAL_STORAGE_DRIVE_UPLOADS_KEY, JSON.stringify([...existingUploads, newUpload]))
      addNotification({
        message: `File "${file.name}" saved to Drive queue locally.`,
        type: "success",
      })
      setIsOpen(false)
      setFile(null)
      setFolderName("CtrlFund Receipts")
    } catch (err: any) {
      console.error("Error uploading to Google Drive:", err)
      setError(err.message || "Failed to upload file to Google Drive.")
      addNotification({
        message: `Failed to upload to Drive queue: ${err.message}`,
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-black/10 text-black hover:bg-black/[0.03] bg-white rounded-xl h-11 px-5 text-xs font-semibold">
          <FolderUp className="mr-2 h-4 w-4 text-[#ccff00]" /> Upload to Drive
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[calc(100%-2rem)] sm:w-full max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto bg-white text-black border border-black/5 rounded-3xl shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-black">Upload to Google Drive</DialogTitle>
          <DialogDescription className="text-xs text-black/60 font-medium">
            Queue a file for Drive upload (stored locally for now).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="drive-file" className="text-right text-black/75 font-semibold text-xs">
                File
              </Label>
              <Input
                id="drive-file"
                type="file"
                onChange={handleFileChange}
                className="col-span-3 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 file:bg-black/5 file:border-0 file:text-black file:text-xs file:font-semibold file:px-3 file:py-1 file:rounded-md file:mr-2 hover:file:bg-black/10"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-name" className="text-right text-black/75 font-semibold text-xs">
                Folder
              </Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="col-span-3 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 placeholder:text-black/30"
                placeholder="e.g., My Receipts"
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-700 rounded-2xl p-4">
              <AlertTitle className="font-bold">Error</AlertTitle>
              <AlertDescription className="text-xs mt-0.5">{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="submit" className="button-gradient px-6 py-2.5 h-11 text-xs" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#ccff00]" /> Uploading...
                </>
              ) : (
                "Upload to Drive"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
