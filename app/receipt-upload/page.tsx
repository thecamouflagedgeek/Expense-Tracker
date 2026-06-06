"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { 
  generateReceiptUploadLink, 
  subscribePendingReceipts, 
  approvePendingReceipt, 
  rejectPendingReceipt 
} from "./service"
import { PendingReceipt } from "./types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Link2, Clock, Copy, Check, Loader2, AlertTriangle, FileCheck, Eye, Trash2, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ReceiptUploadPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<{ linkId: string; uploadUrl: string; expiresAt: any; fallback: boolean } | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [pendingReceipts, setPendingReceipts] = useState<PendingReceipt[]>([])
  const [previewReceipt, setPreviewReceipt] = useState<PendingReceipt | null>(null)
  const [actioningId, setActioningId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, "receipts"),
      where("ownerId", "==", user.id)
    )
    const unsub = onSnapshot(q, (snapshot) => {
      const firestoreReceipts: any[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        firestoreReceipts.push({
          id: doc.id,
          userId: data.ownerId,
          fileName: data.fileName,
          fileType: data.fileType,
          fileSize: data.fileSize,
          description: data.description || "",
          uploadedAt: data.uploadedAt instanceof Timestamp ? data.uploadedAt.toDate().toISOString() : new Date().toISOString(),
          fileData: data.imageData || data.receiptUrl || "",
        })
      })

      const stored = localStorage.getItem("ctrlfund_receipts")
      const localParsed = stored ? JSON.parse(stored) : []
      const merged = [...localParsed]
      let updated = false
      for (const fr of firestoreReceipts) {
        if (!merged.some((r) => r.id === fr.id)) {
          merged.push(fr)
          updated = true
        }
      }
      if (updated) {
        localStorage.setItem("ctrlfund_receipts", JSON.stringify(merged))
        window.dispatchEvent(new Event("receipts-updated"))
      }
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!user) return
    console.log("[Receipt System] Setting up pendingReceipts subscription for owner: " + user.id)
    const unsub = subscribePendingReceipts(user.id, (receipts) => {
      setPendingReceipts(receipts)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!generatedLink) return
    const interval = setInterval(() => {
      const msLeft = getMillis(generatedLink.expiresAt) - Date.now()
      if (msLeft <= 0) {
        setTimeLeft(0)
        clearInterval(interval)
      } else {
        setTimeLeft(Math.floor(msLeft / 1000))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [generatedLink])

  function getMillis(timestamp: any): number {
    if (!timestamp) return 0
    if (typeof timestamp.toMillis === "function") {
      return timestamp.toMillis()
    }
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().getTime()
    }
    if (timestamp instanceof Date) {
      return timestamp.getTime()
    }
    if (typeof timestamp === "number") {
      return timestamp
    }
    return 0
  }

  const handleGenerate = async () => {
    if (!user) return
    setLoading(true)
    try {
      const result = await generateReceiptUploadLink(user.id)
      setGeneratedLink(result)
      const msLeft = getMillis(result.expiresAt) - Date.now()
      setTimeLeft(Math.max(0, Math.floor(msLeft / 1000)))
    } catch (err) {
      console.error("[Receipt System] Link generation handler caught error: ", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedLink) return
    try {
      await navigator.clipboard.writeText(generatedLink.uploadUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error(err)
    }
  }

  const handleApprove = async (receipt: PendingReceipt) => {
    console.log("[Receipt System] User clicked Approve for receipt: " + receipt.id)
    setActioningId(receipt.id)
    try {
      await approvePendingReceipt(receipt)
      console.log("[Receipt System] Approval action finished successfully.")
    } catch (err) {
      console.error("[Receipt System] Approval action failed in handler: ", err)
    } finally {
      setActioningId(null)
    }
  }

  const handleReject = async (receiptId: string) => {
    console.log("[Receipt System] User clicked Reject for receipt: " + receiptId)
    setActioningId(receiptId)
    try {
      await rejectPendingReceipt(receiptId)
      console.log("[Receipt System] Rejection action finished successfully.")
    } catch (err) {
      console.error("[Receipt System] Rejection action failed in handler: ", err)
    } finally {
      setActioningId(null)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full border border-black/5 bg-white/70 shadow-xl rounded-3xl p-6 text-center">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-red-500">Access Denied</CardTitle>
            <CardDescription className="text-sm">Please log in to generate temporary upload links.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-8 max-w-4xl"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-black flex items-center gap-2">
          <Link2 className="w-8 h-8 text-black stroke-[3]" />
          Receipt Sharing Generator
        </h1>
        <p className="text-sm text-black/50 font-semibold mt-1">
          Generate secure, temporary upload links for direct receipt uploads.
        </p>
      </div>

      {generatedLink?.fallback && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-3xl flex gap-3 text-xs shadow-sm font-medium"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="font-extrabold text-amber-800">Firestore Rules Permission Required</p>
            <p className="opacity-90">
              The Firestore database rejected the write request. Paste the rules below into Firebase Console:
            </p>
            <pre className="mt-2 p-2 bg-black/5 border border-black/5 rounded-xl font-mono text-[10px] text-black overflow-x-auto select-all">
{`match /uploadLinks/{linkId} {
  allow read: if true;
  allow write: if request.auth != null;
}
match /pendingReceipts/{receiptId} {
  allow create: if true;
  allow read, update, delete: if request.auth != null;
}`}
            </pre>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="border border-black/5 bg-white/70 backdrop-blur rounded-3xl shadow-xl overflow-hidden h-full">
            <CardHeader className="border-b border-black/5 bg-black/[0.01] px-6 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-black">
                Link Generation
              </CardTitle>
              <CardDescription className="text-xs">
                Generate a unique receipt upload link that expires in 5 minutes.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/[0.02] border border-black/5">
                <div>
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Logged In User</p>
                  <p className="text-xs font-semibold text-black">{user.email}</p>
                </div>
                <Badge variant="secondary" className="bg-black/5 text-black border-none text-[10px] px-2 py-0.5">
                  Authorized
                </Badge>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="button-gradient w-full h-11 text-xs font-bold rounded-2xl text-black hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Upload Link"
                )}
              </Button>

              {generatedLink && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-4 p-4 rounded-2xl border border-black/5 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-black flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-black/50" />
                      {timeLeft !== null && timeLeft > 0 ? (
                        <span className="text-emerald-600 font-mono">Expires in {formatTime(timeLeft)}</span>
                      ) : (
                        <span className="text-red-500 font-mono">Expired</span>
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {generatedLink.fallback && (
                        <Badge variant="outline" className="border-amber-300 text-amber-800 bg-amber-50 text-[9px] px-1.5 py-0.5">
                          Local Mock
                        </Badge>
                      )}
                      <Badge
                        variant="default"
                        className={`border-none text-[10px] font-black ${
                          timeLeft !== null && timeLeft > 0 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                        }`}
                      >
                        {timeLeft !== null && timeLeft > 0 ? "ACTIVE" : "EXPIRED"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Generated URL</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink.uploadUrl}
                        className="flex-1 bg-black/[0.02] border border-black/5 rounded-xl px-3 py-2 text-xs font-mono select-all focus:outline-none"
                      />
                      <Button
                        onClick={handleCopy}
                        variant="outline"
                        className="h-9 w-9 p-0 rounded-xl border border-black/5 hover:bg-black/5"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border border-black/5 bg-white/70 backdrop-blur rounded-3xl shadow-xl overflow-hidden h-full">
            <CardHeader className="border-b border-black/5 bg-black/[0.01] px-6 py-4">
              <CardTitle className="text-base font-bold text-black">
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4 text-xs font-medium text-black/70">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#ccff00] text-black font-black flex items-center justify-center flex-shrink-0">1</div>
                <p>Generate a temporary upload link that expires in 5 minutes.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#ccff00] text-black font-black flex items-center justify-center flex-shrink-0">2</div>
                <p>Share the link with anyone who needs to send you a receipt.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#ccff00] text-black font-black flex items-center justify-center flex-shrink-0">3</div>
                <p>They select a file or take a photo to send it for your approval.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#ccff00] text-black font-black flex items-center justify-center flex-shrink-0">4</div>
                <p>Review and approve uploads below to add them permanently.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {pendingReceipts.length > 0 && (
        <Card className="border border-black/5 bg-white/70 backdrop-blur rounded-3xl shadow-xl overflow-hidden mt-8">
          <CardHeader className="border-b border-black/5 bg-black/[0.01] px-6 py-4">
            <CardTitle className="text-lg font-bold text-black">
              Pending Approval Requests
            </CardTitle>
            <CardDescription className="text-xs">
              Review and approve or reject receipts uploaded via sharing links.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {pendingReceipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-2xl bg-white border border-black/5 shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-black truncate">{receipt.fileName}</p>
                    <p className="text-[10px] text-black/50 font-semibold mt-0.5">
                      {receipt.description || "No description"} · {(receipt.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-black/50 hover:text-black hover:bg-black/5 rounded-full w-8 h-8"
                      onClick={() => setPreviewReceipt(receipt)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={actioningId !== null}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8"
                      onClick={() => handleReject(receipt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      disabled={actioningId !== null}
                      className="button-gradient text-xs h-9 px-4 rounded-xl text-black hover:opacity-90 font-bold"
                      onClick={() => handleApprove(receipt)}
                    >
                      {actioningId === receipt.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Approve"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!previewReceipt} onOpenChange={(open) => !open && setPreviewReceipt(null)}>
        <DialogContent className="sm:max-w-[600px] border border-black/5 bg-white rounded-3xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-black">
              Receipt File Preview
            </DialogTitle>
            <DialogDescription className="text-xs text-black/50">
              Review receipt details before approval.
            </DialogDescription>
          </DialogHeader>

          {previewReceipt && (
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex justify-between items-center bg-black/[0.01] border border-black/5 rounded-2xl p-3 text-xs">
                <div>
                  <p className="font-bold text-black">{previewReceipt.fileName}</p>
                  <p className="text-black/40 font-mono text-[10px] mt-0.5">Type: {previewReceipt.fileType}</p>
                </div>
                <Badge variant="secondary" className="bg-black/5 text-black border-none text-[10px]">
                  {(previewReceipt.fileSize / 1024).toFixed(1)} KB
                </Badge>
              </div>

              <div className="w-full flex justify-center bg-black/[0.02] border border-black/5 rounded-3xl overflow-hidden p-4 max-h-[350px]">
                {previewReceipt.fileType.startsWith("image/") ? (
                  <img
                    src={previewReceipt.imageData}
                    alt="Receipt preview"
                    className="max-w-full max-h-full object-contain rounded-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-black/50">
                    <FileText className="w-16 h-16 opacity-60 mb-2" />
                    <p className="text-xs font-bold">PDF Document</p>
                    <a
                      href={previewReceipt.imageData}
                      download={previewReceipt.fileName}
                      className="text-xs text-blue-600 underline font-semibold mt-2"
                    >
                      Download to view PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
