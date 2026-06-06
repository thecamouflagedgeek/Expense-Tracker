"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useTransactions } from "@/context/transaction-context"
import { useCurrency } from "@/context/currency-context"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { 
  Link2, Clock, Copy, Check, Loader2, AlertTriangle, 
  FileCheck, Eye, Trash2, FileText, ChevronDown, Pencil, X 
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function ReceiptUploadPage() {
  const { user, loading: authLoading } = useAuth()
  const { categories, renameCategory } = useTransactions()
  const { symbol, convertToINR, currency } = useCurrency()

  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<{ linkId: string; uploadUrl: string; expiresAt: any; fallback: boolean } | null>(null)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [pendingReceipts, setPendingReceipts] = useState<PendingReceipt[]>([])
  const [actioningId, setActioningId] = useState<string | null>(null)

  // Dialog States
  const [reviewReceipt, setReviewReceipt] = useState<PendingReceipt | null>(null)
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")
  const [notes, setNotes] = useState("")
  const [dialogError, setDialogError] = useState<string | null>(null)
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState("")

  // Subscribe to final receipts to handle local storage cache sync
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
      let merged = [...localParsed]
      let updated = false
      for (const fr of firestoreReceipts) {
        if (!merged.some((r) => r.id === fr.id)) {
          merged.push(fr)
          updated = true
        }
      }

      // Deduplicate to clean up any past duplicates based on content similarity
      const seen = new Set<string>()
      const uniqueMerged: any[] = []
      for (const receipt of merged) {
        const key = `${receipt.userId}_${receipt.fileName}_${receipt.fileSize}`
        if (!seen.has(key)) {
          seen.add(key)
          uniqueMerged.push(receipt)
        } else {
          const existingIndex = uniqueMerged.findIndex(
            (r) => r.fileName === receipt.fileName && r.fileSize === receipt.fileSize && r.userId === receipt.userId
          )
          if (existingIndex !== -1) {
            const isCurrentFromFirestore = firestoreReceipts.some((fr) => fr.id === receipt.id)
            const isExistingFromFirestore = firestoreReceipts.some((fr) => fr.id === uniqueMerged[existingIndex].id)
            if (isCurrentFromFirestore && !isExistingFromFirestore) {
              uniqueMerged[existingIndex] = receipt
            }
          }
          updated = true
        }
      }

      if (updated) {
        localStorage.setItem("ctrlfund_receipts", JSON.stringify(uniqueMerged))
        window.dispatchEvent(new Event("receipts-updated"))
      }
    })
    return () => unsub()
  }, [user])

  // Subscribe to pending receipts
  useEffect(() => {
    if (!user) return
    console.log("[Receipt System] Setting up pendingReceipts subscription for owner: " + user.id)
    const unsub = subscribePendingReceipts(user.id, (receipts) => {
      setPendingReceipts(receipts)
    })
    return () => unsub()
  }, [user])

  // Countdown timer for sharing link expiration
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

  const handleRenameCategory = async (oldName: string) => {
    try {
      setDialogError(null)
      await renameCategory(oldName, editCatName)
      if (category === oldName) {
        setCategory(editCatName.trim())
      }
      setEditingCat(null)
    } catch (err: any) {
      setDialogError(err.message || "Failed to rename category.")
    }
  }

  const availableCategories = Array.from(
    new Set([...categories, "Transfer"].filter((categoryName) => categoryName && categoryName !== "New Category")),
  )
  const normalizedCategorySearch = categorySearch.trim().toLowerCase()
  const filteredCategories = availableCategories.filter((categoryName) =>
    categoryName.toLowerCase().includes(normalizedCategorySearch),
  )
  const canCreateCategory =
    categorySearch.trim().length > 0 &&
    !availableCategories.some((categoryName) => categoryName.toLowerCase() === normalizedCategorySearch)

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewReceipt) return

    const enteredAmount = parseFloat(amount)
    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      setDialogError("Please enter a valid amount greater than 0.")
      return
    }

    if (!category.trim()) {
      setDialogError("Please select or enter a category.")
      return
    }

    setActioningId(reviewReceipt.id)
    setDialogError(null)

    try {
      const amountInINR = currency === "INR" ? enteredAmount : convertToINR(enteredAmount)

      await approvePendingReceipt(reviewReceipt, {
        amount: amountInINR,
        category: category.trim(),
        notes: notes.trim(),
      })
      setReviewReceipt(null)
    } catch (err: any) {
      console.error(err)
      setDialogError(err.message || "Failed to approve receipt.")
    } finally {
      setActioningId(null)
    }
  }

  const handleRejectClick = async () => {
    if (!reviewReceipt) return
    setActioningId(reviewReceipt.id)
    setDialogError(null)
    try {
      await rejectPendingReceipt(reviewReceipt.id)
      setReviewReceipt(null)
    } catch (err: any) {
      console.error(err)
      setDialogError(err.message || "Failed to reject receipt.")
    } finally {
      setActioningId(null)
    }
  }

  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    })
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
      className="container mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-8 max-w-5xl"
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
                <p>They take a photo or select an image to submit it. Uploaders enter no financial amounts.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#ccff00] text-black font-black flex items-center justify-center flex-shrink-0">4</div>
                <p>Review details, input Amount/Category/Notes, and Approve to create the transaction.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {pendingReceipts.length > 0 && (
        <div className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <Clock className="w-5 h-5 text-black" />
              Pending Approval Requests
            </h2>
            <p className="text-xs text-black/50 font-semibold mt-0.5">
              Review details and approve or reject receipts uploaded via sharing links.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {pendingReceipts.map((receipt) => (
              <motion.div
                key={receipt.id}
                whileHover={{ y: -4 }}
                onClick={() => {
                  setReviewReceipt(receipt)
                  setAmount("")
                  setCategory("")
                  setCategorySearch("")
                  setNotes(receipt.description || "")
                  setDialogError(null)
                }}
                className="group border border-black/5 bg-white rounded-3xl shadow-sm hover:shadow-md cursor-pointer overflow-hidden transition-all duration-300 flex flex-col h-full"
              >
                <div className="h-40 w-full bg-black/[0.02] relative flex items-center justify-center border-b border-black/5 overflow-hidden">
                  {receipt.fileType.startsWith("image/") ? (
                    <img
                      src={receipt.imageData}
                      alt={receipt.fileName}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-black/40">
                      <FileText className="w-12 h-12 stroke-[1.5]" />
                      <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">PDF Document</span>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[9px] font-extrabold uppercase border-none px-2 py-0.5 rounded-full tracking-wider shadow-sm">
                      Pending
                    </Badge>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-black truncate mb-1 group-hover:text-black/80 transition-colors">
                      {receipt.fileName}
                    </h3>
                    <p className="text-[10px] text-black/60 font-semibold line-clamp-2 min-h-[2.5rem]">
                      {receipt.description || "No description provided."}
                    </p>
                  </div>

                  <div className="border-t border-black/5 pt-3 mt-3 flex items-center justify-between text-[9px] text-black/40 font-bold uppercase tracking-wider">
                    <span>{(receipt.fileSize / 1024).toFixed(1)} KB</span>
                    <span>{formatDateTime(receipt.uploadedAt)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewReceipt} onOpenChange={(open) => !open && setReviewReceipt(null)}>
        <DialogContent className="sm:max-w-[550px] w-[calc(100%-2rem)] sm:w-full max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto border border-black/5 bg-white rounded-3xl p-6 shadow-2xl z-[999]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-black flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-black" />
              Review & Approve Receipt
            </DialogTitle>
            <DialogDescription className="text-xs text-black/50">
              Only approved receipts create transaction records. Enter details below.
            </DialogDescription>
          </DialogHeader>

          {reviewReceipt && (
            <div className="flex flex-col gap-4 mt-2">
              <div className="w-full flex justify-center bg-black/[0.02] border border-black/5 rounded-3xl overflow-hidden p-4 max-h-[250px] relative">
                {reviewReceipt.fileType.startsWith("image/") ? (
                  <img
                    src={reviewReceipt.imageData}
                    alt="Receipt preview"
                    className="max-w-full max-h-full object-contain rounded-2xl cursor-pointer hover:opacity-90"
                    onClick={() => {
                      const w = window.open()
                      if (w) w.document.write(`<img src="${reviewReceipt.imageData}" style="max-width:100%; max-height:100%; display:block; margin:auto;" />`)
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-black/50 w-full">
                    <FileText className="w-16 h-16 opacity-60 mb-2" />
                    <p className="text-xs font-bold">PDF Document</p>
                    <a
                      href={reviewReceipt.imageData}
                      download={reviewReceipt.fileName}
                      className="text-xs text-blue-600 underline font-semibold mt-2"
                    >
                      Download to view PDF
                    </a>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center bg-black/[0.01] border border-black/5 rounded-2xl p-3 text-[10px] font-bold text-black/50 uppercase tracking-wider">
                <div>
                  <p className="text-black truncate max-w-[200px]">{reviewReceipt.fileName}</p>
                  <p className="font-mono text-[9px] mt-0.5">Uploaded: {formatDateTime(reviewReceipt.uploadedAt)}</p>
                </div>
                <Badge variant="secondary" className="bg-black/5 text-black border-none text-[9px] font-black">
                  {(reviewReceipt.fileSize / 1024).toFixed(1)} KB
                </Badge>
              </div>

              <form onSubmit={handleApproveSubmit} className="space-y-4 pt-2 border-t border-black/5">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dialog-amount" className="text-right text-black/75 font-semibold text-xs">
                    Amount <span className="text-[#0c0d0e] font-black">({symbol})</span>
                  </Label>
                  <div className="col-span-3 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-black/50 select-none">
                      {symbol}
                    </span>
                    <Input
                      id="dialog-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-7 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 font-bold"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dialog-category" className="text-right text-black/75 font-semibold text-xs">
                    Category
                  </Label>
                  <Popover
                    open={categoryOpen}
                    onOpenChange={(open) => {
                      setCategoryOpen(open)
                      if (open) {
                        setCategorySearch(category)
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        id="dialog-category"
                        type="button"
                        variant="outline"
                        className="col-span-3 justify-between bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 font-bold"
                      >
                        <span className={`truncate ${!category ? "text-black/40" : "text-black"}`}>
                          {category || "Select or type a category"}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 text-black/40" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-black/5 rounded-2xl shadow-2xl z-[9999]">
                      <Command shouldFilter={false}>
                        <CommandInput
                          value={categorySearch}
                          onValueChange={setCategorySearch}
                          placeholder="Type a category"
                        />
                        <CommandList>
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup heading="Categories">
                            {filteredCategories.map((cat) => (
                              <CommandItem
                                key={cat}
                                value={cat}
                                onSelect={() => {
                                  if (editingCat === cat) return
                                  setCategory(cat)
                                  setCategorySearch(cat)
                                  setCategoryOpen(false)
                                }}
                                className="flex items-center justify-between cursor-pointer font-semibold text-xs py-2 px-3 group"
                              >
                                {editingCat === cat ? (
                                  <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="text"
                                      value={editCatName}
                                      onChange={(e) => setEditCatName(e.target.value)}
                                      className="flex-1 bg-black/[0.04] border border-black/10 px-2 py-0.5 rounded text-[11px] font-semibold text-black focus:outline-none focus:ring-1 focus:ring-black"
                                      autoFocus
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRenameCategory(cat)}
                                      className="p-1 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingCat(null)}
                                      className="p-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="truncate">{cat}</span>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setEditingCat(cat)
                                        setEditCatName(cat)
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 text-black/40 hover:text-black hover:bg-black/5 rounded transition-opacity"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                          {canCreateCategory && (
                            <>
                              <CommandSeparator />
                              <CommandGroup heading="Create new">
                                <CommandItem
                                  key={`create-${categorySearch.trim()}`}
                                  value={categorySearch.trim()}
                                  onSelect={() => {
                                    const nextCategory = categorySearch.trim()
                                    setCategory(nextCategory)
                                    setCategorySearch(nextCategory)
                                    setCategoryOpen(false)
                                  }}
                                  className="cursor-pointer font-semibold text-xs py-2 px-3 text-emerald-700"
                                >
                                  + Add "{categorySearch.trim()}"
                                </CommandItem>
                              </CommandGroup>
                            </>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="dialog-notes" className="text-right text-black/75 font-semibold text-xs mt-2.5">
                    Notes
                  </Label>
                  <Textarea
                    id="dialog-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="col-span-3 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-2xl p-4 text-xs font-semibold placeholder:text-black/30 min-h-[60px]"
                    placeholder="Optional transaction description"
                  />
                </div>

                {dialogError && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700 rounded-2xl p-3">
                    <AlertTitle className="font-bold text-xs">Error</AlertTitle>
                    <AlertDescription className="text-[10px] mt-0.5">{dialogError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between items-center gap-3 pt-3 border-t border-black/5">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={actioningId !== null}
                    onClick={handleRejectClick}
                    className="flex-1 border-red-100 text-red-500 hover:bg-red-50 rounded-2xl text-xs font-extrabold h-11 uppercase tracking-wider"
                  >
                    {actioningId === reviewReceipt.id && !amount ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Reject Receipt"
                    )}
                  </Button>
                  <Button
                    type="submit"
                    disabled={actioningId !== null}
                    className="flex-1 button-gradient text-[#0c0d0e] rounded-2xl text-xs font-extrabold h-11 uppercase tracking-wider animate-pulse hover:animate-none"
                  >
                    {actioningId === reviewReceipt.id && amount ? (
                      <Loader2 className="h-4 w-4 animate-spin animate-none" />
                    ) : (
                      "Approve & Create"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
