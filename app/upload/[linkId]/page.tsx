"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { validateUploadLink, uploadReceiptToFirebase } from "@/app/receipt-upload/service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, UploadCloud, CheckCircle2, AlertTriangle, Camera, FileText } from "lucide-react"

async function compressImage(file: File): Promise<File> {
  console.log("[Receipt System] Starting client-side compression for image: " + file.name)
  if (!file.type.startsWith("image/")) {
    console.log("[Receipt System] File is not an image. Skipping compression.")
    return file
  }
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        let width = img.width
        let height = img.height
        const MAX_WIDTH = 1200
        const MAX_HEIGHT = 1200
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressed = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                })
                console.log(`[Receipt System] Compressed file size: ${(compressed.size / 1024).toFixed(1)} KB (Original: ${(file.size / 1024).toFixed(1)} KB)`)
                resolve(compressed)
              } else {
                console.log("[Receipt System] Failed to compress image blob. Using original.")
                resolve(file)
              }
            },
            "image/jpeg",
            0.75
          )
        } else {
          console.log("[Receipt System] Failed to obtain canvas context. Using original.")
          resolve(file)
        }
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

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
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!linkId) return
    const checkLink = async () => {
      try {
        console.log("[Receipt System] Requesting validation for linkId: " + linkId)
        const result = await validateUploadLink(linkId)
        setIsValid(result.valid)
        if (result.valid && result.ownerId) {
          setOwnerId(result.ownerId)
          console.log("[Receipt System] Link is valid. Associated ownerId: " + result.ownerId)
        } else {
          console.log("[Receipt System] Link is invalid or expired.")
        }
      } catch (err) {
        console.error("[Receipt System] Verification request encountered error", err)
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
      console.log("[Receipt System] Selected file: " + e.target.files[0].name)
    }
  }

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const triggerCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !ownerId) return
    setUploading(true)
    setError(null)
    console.log("[Receipt System] Upload form submitted.")
    try {
      const processedFile = await compressImage(file)
      console.log("[Receipt System] Initiating file stream and metadata creation.")
      await uploadReceiptToFirebase(ownerId, linkId, processedFile, description)
      console.log("[Receipt System] File uploaded successfully. Displaying success view.")
      setSuccess(true)
    } catch (err: any) {
      console.error("[Receipt System] Submission workflow failed", err)
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
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <Card className="border border-red-200 bg-red-50/50 shadow-xl rounded-3xl p-6 text-center">
            <CardHeader className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-bold text-red-700">Link Expired or Invalid</CardTitle>
              <CardDescription className="text-red-600/85 mt-1">
                This upload link has expired.
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
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
          <Card className="border border-emerald-200 bg-emerald-50/50 shadow-xl rounded-3xl p-6 text-center">
            <CardHeader className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle className="text-xl font-bold text-emerald-800">Upload Complete</CardTitle>
              <CardDescription className="text-emerald-700/80 mt-1">
                Receipt uploaded successfully and is pending approval from the owner.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[500px] px-4">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full">
        <Card className="border border-black/5 bg-white/70 backdrop-blur rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="border-b border-black/5 bg-black/[0.01] px-6 py-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-black">
              <UploadCloud className="w-5 h-5 text-black" />
              Upload Receipt
            </CardTitle>
            <CardDescription className="text-xs">
              Upload an invoice image/PDF or take a photo directly from your camera.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-2">
                <Label className="text-xs font-bold text-black/50">Receipt Source</Label>
                <input type="file" accept="image/*,.pdf" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} ref={cameraInputRef} className="hidden" />
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerCamera}
                    className="h-20 rounded-2xl flex flex-col items-center justify-center border border-black/10 hover:bg-black/5 gap-1.5"
                  >
                    <Camera className="w-5 h-5 text-black/60" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Take Photo</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={triggerFileSelect}
                    className="h-20 rounded-2xl flex flex-col items-center justify-center border border-black/10 hover:bg-black/5 gap-1.5"
                  >
                    <UploadCloud className="w-5 h-5 text-black/60" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Choose File</span>
                  </Button>
                </div>
              </div>

              {file && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-3 bg-black/[0.02] border border-black/5 rounded-2xl"
                >
                  <FileText className="w-8 h-8 text-black/50" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-black truncate">{file.name}</p>
                    <p className="text-[10px] text-black/45">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </motion.div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-bold text-black/50">Description (Optional)</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Office supplies"
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
