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
import { uploadFileToDrive } from "@/lib/google-drive"
import { useNotification } from "@/contexts/notification-context"

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
      await uploadFileToDrive(file, folderName, user.accessToken as string)
      addNotification({
        id: Date.now(),
        message: `File "${file.name}" uploaded to Google Drive successfully!`,
        type: "success",
      })
      setIsOpen(false)
      setFile(null)
      setFolderName("CtrlFund Receipts")
    } catch (err: any) {
      console.error("Error uploading to Google Drive:", err)
      setError(err.message || "Failed to upload file to Google Drive.")
      addNotification({
        id: Date.now(),
        message: `Failed to upload to Google Drive: ${err.message}`,
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
          <FolderUp className="mr-2 h-4 w-4" /> Upload to Drive
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#222831] text-[#EEEEEE] border-[#00ADB5]">
        <DialogHeader>
          <DialogTitle className="text-[#00ADB5]">Upload to Google Drive</DialogTitle>
          <DialogDescription className="text-[#EEEEEE]/70">
            Upload a file directly to your Google Drive.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="drive-file" className="text-right text-[#EEEEEE]">
                File
              </Label>
              <Input
                id="drive-file"
                type="file"
                onChange={handleFileChange}
                className="col-span-3 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] file:text-[#00ADB5] file:bg-[#393E46] file:border-[#00ADB5] file:border file:rounded-md file:px-3 file:py-1 file:mr-2"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-name" className="text-right text-[#EEEEEE]">
                Folder
              </Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="col-span-3 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5]"
                placeholder="e.g., My Receipts"
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
                "Upload to Drive"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
