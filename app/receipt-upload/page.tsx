"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { generateReceiptUploadLink } from "./service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Link2, Clock, Copy, Check, Loader2, AlertTriangle, FileCheck } from "lucide-react"

export default function ReceiptUploadPage() {
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<{ linkId: string; uploadUrl: string; expiresAt: any; fallback: boolean } | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

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
          fileData: data.receiptUrl,
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
      const msLeft = result.expiresAt.toMillis() - Date.now()
      setTimeLeft(Math.max(0, Math.floor(msLeft / 1000)))
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 65
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
                <p>They take a photo or select an existing PDF/image and upload it directly.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#ccff00] text-black font-black flex items-center justify-center flex-shrink-0">4</div>
                <p className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Receipts appear directly in your workspace.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
