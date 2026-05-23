"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRole } from "@/contexts/role-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FileText, Search, Trash2, Eye, Loader2, X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const LOCAL_STORAGE_RECEIPTS_KEY = "ctrlfund_receipts"

type Receipt = {
  id: string
  userId: string
  fileName: string
  fileType: string
  fileSize: number
  description: string
  uploadedAt: string
  fileData: string
}

export function ReceiptsPanel() {
  const { user } = useAuth()
  const { permissions } = useRole()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [previewReceipt, setPreviewReceipt] = useState<Receipt | null>(null)

  const loadReceipts = () => {
    setLoading(true)
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_RECEIPTS_KEY)
      const parsed: Receipt[] = stored ? JSON.parse(stored) : []
      if (permissions.canManageUsers) {
        setReceipts(parsed)
      } else if (user) {
        setReceipts(parsed.filter((r) => r.userId === user.id))
      } else {
        setReceipts([])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReceipts()
    const handleRefresh = () => loadReceipts()
    window.addEventListener("receipts-updated", handleRefresh)
    return () => window.removeEventListener("receipts-updated", handleRefresh)
  }, [user, permissions.canManageUsers])

  const filteredReceipts = useMemo(() => {
    if (!query) return receipts
    return receipts.filter(
      (r) =>
        r.fileName.toLowerCase().includes(query.toLowerCase()) ||
        r.description?.toLowerCase().includes(query.toLowerCase()),
    )
  }, [receipts, query])

  const handleDelete = () => {
    if (!confirmDeleteId) return
    setIsDeleting(true)
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_RECEIPTS_KEY)
      const parsed: Receipt[] = stored ? JSON.parse(stored) : []
      const updated = parsed.filter((r) => r.id !== confirmDeleteId)
      localStorage.setItem(LOCAL_STORAGE_RECEIPTS_KEY, JSON.stringify(updated))
      setReceipts(updated)
      setConfirmDeleteId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!permissions.canViewReceipts) {
    return (
      <Card className="card-gradient border-none p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-base font-bold text-black tracking-tight">Receipts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-center text-black/45 font-semibold py-12 bg-white border border-black/5 rounded-2xl">
            <p className="text-sm font-bold">Access restricted.</p>
            <p className="text-xs text-black/40 mt-1">You do not have permission to view receipts.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-gradient border-none p-6">
      <CardHeader className="p-0 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle className="text-base font-bold text-black tracking-tight">Receipts</CardTitle>
          <p className="text-xs text-black/45 font-semibold">All uploaded receipts in one place.</p>
        </div>
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search receipts..."
            className="pl-9 bg-white text-black border border-black/5 hover:bg-black/[0.02] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 font-semibold shadow-sm placeholder:text-black/30"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-black">
            <Loader2 className="h-6 w-6 animate-spin text-black" />
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="text-center text-black/45 font-semibold py-12 bg-white border border-black/5 rounded-2xl">
            <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-3">
              <FileText className="h-5 w-5 text-black/40" />
            </div>
            <p className="text-sm font-bold">No receipts uploaded yet.</p>
            <p className="text-xs text-black/40 mt-1">Upload a receipt to keep records organized.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReceipts.map((receipt) => (
              <div
                key={receipt.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded-2xl bg-white border border-black/5"
              >
                <div>
                  <p className="text-sm font-bold text-black truncate">{receipt.fileName}</p>
                  <p className="text-[10px] text-black/50 font-semibold">
                    {receipt.description || "No description"} · {(receipt.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-black/50 hover:text-black hover:bg-black/5 rounded-full w-8 h-8"
                    onClick={() => setPreviewReceipt(receipt)}
                    title="View Receipt"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>

                  {permissions.canDeleteReceipts && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8"
                      onClick={() => setConfirmDeleteId(receipt.id)}
                      title="Delete Receipt"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <AlertDialog open={Boolean(confirmDeleteId)} onOpenChange={() => setConfirmDeleteId(null)}>
        <AlertDialogContent className="bg-white text-black border border-black/5 rounded-3xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black">Delete receipt?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-black/60">
              This removes the receipt file permanently. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={Boolean(previewReceipt)} onOpenChange={(open) => { if (!open) setPreviewReceipt(null) }}>
        <DialogContent className="sm:max-w-[900px] w-[90vw] max-h-[90vh] rounded-2xl p-0 overflow-hidden">
          <div className="relative bg-white">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3 rounded-full w-8 h-8 bg-white/80 text-black/60 shadow-sm z-10"
              onClick={() => setPreviewReceipt(null)}
            >
              <X className="h-4 w-4" />
            </Button>

            {previewReceipt && (previewReceipt.fileType?.startsWith("image/") ? (
              <img src={previewReceipt.fileData} alt={previewReceipt.fileName} className="block w-full h-auto max-h-[80vh] object-contain" />
            ) : previewReceipt.fileType === "application/pdf" ? (
              <iframe src={previewReceipt.fileData} title={previewReceipt.fileName} className="w-full h-[80vh] border-0" />
            ) : (
              <div className="p-4 text-xs text-black/60">
                Preview not available for this file type.
                <div className="mt-2">
                  <a href={previewReceipt?.fileData} target="_blank" rel="noreferrer" className="text-emerald-600 underline text-xs">Open in new tab</a>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
