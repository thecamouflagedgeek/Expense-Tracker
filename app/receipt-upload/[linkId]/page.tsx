"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { validateUploadLink, createPendingReceipt } from "../service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, UploadCloud, CheckCircle2, AlertTriangle, FileText } from "lucide-react"

export default function PublicUploadPage() {
  const params = useParams()
  const linkId = params.linkId as string

  const [checking, setChecking] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [ownerId, setOwnerId] = useState("")

  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!linkId) return
    const checkLink = async () => {
      try {
        const result = await validateUploadLink(linkId)
        setIsValid(result.valid)
        if (result.valid && result.ownerId) {
          setOwnerId(result.ownerId)
        }
      } catch (err) {
        setIsValid(false)
      } finally {
        setChecking(false)
      }
    }
    checkLink()
  }, [linkId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !ownerId) return

    setUploading(true)
    setError(null)

    try {
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const receiptId = crypto.randomUUID()
      await createPendingReceipt({
        id: receiptId,
        linkId,
        ownerId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        description,
        uploadedAt: new Date().toISOString(),
        fileData,
      })

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to upload receipt")
    } finally {
      setUploading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="border border-red-200 bg-red-50/50 shadow-xl rounded-3xl p-6 text-center">
            <CardHeader className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold text-red-700">Link Expired or Invalid</CardTitle>
              <CardDescription className="text-red-600/80 mt-1">
                This receipt upload link is no longer active. Please request a new QR link from the owner.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px] px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="border border-emerald-200 bg-emerald-50/50 shadow-xl rounded-3xl p-6 text-center">
            <CardHeader className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-xl font-bold text-emerald-800">Upload Complete</CardTitle>
              <CardDescription className="text-emerald-700/80 mt-1">
                Your receipt has been submitted successfully and is pending approval from the owner.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[500px] px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <Card className="border border-black/5 bg-white/70 backdrop-blur rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="border-b border-black/5 bg-black/[0.01] px-6 py-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-black">
              <UploadCloud className="w-5 h-5 text-black" />
              Upload Receipt
            </CardTitle>
            <CardDescription className="text-xs">
              Upload an invoice image or PDF. It will be sent to the owner for approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <Label htmlFor="file" className="text-xs font-bold text-black/50">Receipt File</Label>
                <div className="flex flex-col items-center justify-center border border-dashed border-black/15 rounded-2xl p-6 bg-black/[0.01] hover:bg-black/[0.02] transition-colors cursor-pointer relative">
                  <Input
                    id="file"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <FileText className="w-8 h-8 text-black/50" />
                      <p className="text-xs font-bold text-black truncate max-w-[200px]">{file.name}</p>
                      <p className="text-[10px] text-black/45">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center">
                      <UploadCloud className="w-8 h-8 text-black/30" />
                      <p className="text-xs font-bold text-black/60">Choose file or drag & drop</p>
                      <p className="text-[10px] text-black/40">PNG, JPG, JPEG, or PDF</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-bold text-black/50">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Starbucks team lunch"
                  className="bg-white text-black border border-black/5 rounded-2xl text-xs h-10 font-semibold shadow-sm focus:ring-2 focus:ring-black placeholder:text-black/30"
                />
              </div>

              {error && (
                <Alert variant="destructive" className="rounded-2xl">
                  <AlertTitle className="text-xs font-bold">Upload Failed</AlertTitle>
                  <AlertDescription className="text-[11px]">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={uploading || !file}
                className="button-gradient w-full h-11 text-xs font-bold rounded-2xl text-black hover:opacity-90 transition-opacity"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Receipt"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
