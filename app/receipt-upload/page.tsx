"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { generateReceiptUploadLink, validateUploadLink, subscribePendingReceipts, approvePendingReceipt, rejectPendingReceipt } from "./service"
import { PendingReceipt } from "./types"
import GenerateUploadQR from "@/components/generate-qr-code"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Link2, Clock, Copy, Check, Loader2, CheckCircle2, XCircle, FileText, AlertTriangle, Eye } from "lucide-react"

export default function ReceiptUploadPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<{ linkId: string; uploadUrl: string; expiresAt: any; fallback: boolean } | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  
  const [validationId, setValidationId] = useState("")
  const [validating, setValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    checked: boolean
    valid: boolean
    ownerId?: string
    fallback?: boolean
    error?: string
  } | null>(null)

  const [pendingReceipts, setPendingReceipts] = useState<PendingReceipt[]>([])
  const [actioningId, setActioningId] = useState<string | null>(null)
  const [previewReceipt, setPreviewReceipt] = useState<PendingReceipt | null>(null)

  useEffect(() => {
    if (!user) return
    const unsub = subscribePendingReceipts(user.id, (receipts) => {
      setPendingReceipts(receipts)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!generatedLink) return
    const interval = setInterval(() => {
      const msLeft = generatedLink.expiresAt.toMillis() - Date.now()
      if (msLeft <= 0) {
        setTimeLeft(0)
        clearInterval(interval)
      } else {
        setTimeLeft(Math.floor(msLeft / 1000))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [generatedLink])

  const handleGenerate = async () => {
    if (!user) return
    setLoading(true)
    try {
      const result = await generateReceiptUploadLink(user.id)
      setGeneratedLink(result)
      setValidationId(result.linkId)
      const msLeft = result.expiresAt.toMillis() - Date.now()
      setTimeLeft(Math.max(0, Math.floor(msLeft / 1000)))
      setValidationResult(null)
    } catch (err) {
      console.error(err)
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

  const handleValidate = async () => {
    if (!validationId) return
    setValidating(true)
    try {
      const result = await validateUploadLink(validationId)
      setValidationResult({
        checked: true,
        valid: result.valid,
        ownerId: result.ownerId,
        fallback: result.fallback,
      })
    } catch (err: any) {
      setValidationResult({
        checked: true,
        valid: false,
        error: err.message || "Unknown error",
      })
    } finally {
      setValidating(false)
    }
  }

  const handleApprove = async (receipt: PendingReceipt) => {
    setActioningId(receipt.id)
    try {
      await approvePendingReceipt(receipt)
    } catch (err) {
      console.error(err)
    } finally {
      setActioningId(null)
    }
  }

  const handleReject = async (receiptId: string) => {
    setActioningId(receiptId)
    try {
      await rejectPendingReceipt(receiptId)
    } catch (err) {
      console.error(err)
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
      className="container mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-8 max-w-6xl"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-black flex items-center gap-2">
          <Link2 className="w-8 h-8 text-black stroke-[3]" />
          Receipt Upload Link Generator
        </h1>
        <p className="text-sm text-black/50 font-semibold mt-1">
          Generate secure, temporary upload links for QR-based uploads.
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
              The Firestore database rejected the write request (likely because security rules are enabled). 
              We have automatically stored this link in browser local storage so that you can verify the interface and validation logic immediately.
            </p>
            <p className="opacity-90 mt-1">
              To persist upload links globally, navigate to the Firebase Console, go to **Firestore Database** &gt; **Rules**, and paste the rule below:
            </p>
            <pre className="mt-2 p-2 bg-black/5 border border-black/5 rounded-xl font-mono text-[10px] text-black overflow-x-auto select-all">
{`match /uploadLinks/{linkId} {
  allow read, write: if request.auth != null;
}`}
            </pre>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          <Card className="border border-black/5 bg-white/70 backdrop-blur rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-black/5 bg-black/[0.01] px-6 py-4">
              <CardTitle className="text-lg font-bold text-black">
                Pending Approval Requests
              </CardTitle>
              <CardDescription className="text-xs">
                Receipts uploaded by scanning the QR code that are awaiting your approval.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {pendingReceipts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-black/40">
                  <FileText className="w-12 h-12 stroke-[1.5] mb-3 opacity-60" />
                  <p className="text-xs font-bold">No pending approvals</p>
                  <p className="text-[10px] opacity-75 mt-0.5">Scanned receipts will appear here for review.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingReceipts.map((receipt) => (
                    <motion.div
                      key={receipt.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-white border border-black/5 rounded-2xl flex flex-col gap-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-black truncate">{receipt.fileName}</p>
                          <p className="text-[10px] text-black/40">{(receipt.fileSize / 1024).toFixed(1)} KB</p>
                        </div>
                        <Badge variant="secondary" className="bg-black/5 text-black border-none text-[9px] px-1.5 py-0.5 whitespace-nowrap">
                          Pending
                        </Badge>
                      </div>

                      {receipt.description && (
                        <p className="text-xs text-black/70 italic px-2 py-1.5 bg-black/[0.01] border border-black/5 rounded-xl">
                          &quot;{receipt.description}&quot;
                        </p>
                      )}

                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreviewReceipt(receipt)}
                          className="flex-1 h-9 rounded-xl text-xs font-bold border-black/5 hover:bg-black/5"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(receipt)}
                          disabled={actioningId === receipt.id}
                          className="flex-1 h-9 rounded-xl text-xs font-bold bg-[#ccff00] text-black hover:bg-[#ccff00]/95"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(receipt.id)}
                          disabled={actioningId === receipt.id}
                          className="h-9 w-9 p-0 rounded-xl border-red-200 text-red-500 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <GenerateUploadQR />
        </div>

        <div className="flex flex-col gap-8">
          <Card className="border border-black/5 bg-white/70 backdrop-blur rounded-3xl shadow-xl overflow-hidden">
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

                  <div className="flex flex-col gap-1.5">
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Link ID</p>
                    <p className="text-xs font-mono bg-black/[0.02] border border-black/5 rounded-xl px-3 py-2 text-black/70 overflow-x-auto">
                      {generatedLink.linkId}
                    </p>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-black/5 bg-white/70 backdrop-blur rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="border-b border-black/5 bg-black/[0.01] px-6 py-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2 text-black">
                Link Validation Tester
              </CardTitle>
              <CardDescription className="text-xs">
                Test and validate receipt upload links using the database API.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Link ID to Validate</label>
                <Input
                  placeholder="Enter Link ID"
                  value={validationId}
                  onChange={(e) => setValidationId(e.target.value)}
                  className="bg-white text-black border border-black/5 rounded-2xl text-xs h-10 font-semibold shadow-sm focus:ring-2 focus:ring-black placeholder:text-black/30"
                />
              </div>

              <Button
                onClick={handleValidate}
                disabled={validating || !validationId}
                variant="outline"
                className="w-full h-11 text-xs font-bold rounded-2xl border border-black/10 hover:bg-black/5"
              >
                {validating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Validate Link"
                )}
              </Button>

              {validationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col gap-3 p-4 rounded-2xl border ${
                    validationResult.valid
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-800"
                      : "bg-red-500/5 border-red-500/20 text-red-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {validationResult.valid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <span className="text-xs font-black">
                      {validationResult.valid ? "Validation Successful" : "Validation Failed"}
                    </span>
                  </div>
                  {validationResult.valid ? (
                    <div className="flex flex-col gap-1 text-[11px] font-medium opacity-90">
                      <p>Status: Active</p>
                      <p>Owner ID: {validationResult.ownerId}</p>
                      {validationResult.fallback && (
                        <p className="text-amber-700 font-bold mt-1">Verified via local mock storage</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] font-medium opacity-90">
                      The link is either expired, invalid, deleted, or does not exist in the database.
                    </p>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
                    src={previewReceipt.fileData}
                    alt="Receipt preview"
                    className="max-w-full max-h-full object-contain rounded-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-black/50">
                    <FileText className="w-16 h-16 opacity-60 mb-2" />
                    <p className="text-xs font-bold">PDF Document</p>
                    <a
                      href={previewReceipt.fileData}
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
