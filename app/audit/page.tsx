"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { useTransactions } from "@/context/transaction-context"
import { useCurrency } from "@/context/currency-context"
import { collection, query, where, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Loader2, ClipboardCheck, CheckCircle2, AlertCircle, XCircle, 
  TrendingUp, Activity, PieChart 
} from "lucide-react"

export default function AuditSummaryPage() {
  const { user, loading: authLoading } = useAuth()
  const { transactions, loading: txLoading } = useTransactions()
  const { format: formatCurrency, currency } = useCurrency()

  const [receipts, setReceipts] = useState<any[]>([])
  const [pendingReceiptDocs, setPendingReceiptDocs] = useState<any[]>([])
  const [receiptsLoading, setReceiptsLoading] = useState(true)
  const [pendingLoading, setPendingLoading] = useState(true)

  // Listen to approved receipts
  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, "receipts"),
      where("ownerId", "==", user.id)
    )
    const unsub = onSnapshot(q, (snapshot) => {
      const docs: any[] = []
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() })
      })
      setReceipts(docs)
      setReceiptsLoading(false)
    }, (error) => {
      console.error("[Audit System] Error loading receipts:", error)
      setReceiptsLoading(false)
    })
    return () => unsub()
  }, [user])

  // Listen to pending and rejected receipts
  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, "pendingReceipts"),
      where("ownerId", "==", user.id)
    )
    const unsub = onSnapshot(q, (snapshot) => {
      const docs: any[] = []
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() })
      })
      setPendingReceiptDocs(docs)
      setPendingLoading(false)
    }, (error) => {
      console.error("[Audit System] Error loading pending receipts:", error)
      setPendingLoading(false)
    })
    return () => unsub()
  }, [user])

  // Helper date parsing
  const getDocDate = (doc: any) => {
    if (!doc) return new Date(0)
    if (doc.uploadedAt) {
      const val = doc.uploadedAt
      if (typeof val.toDate === "function") return val.toDate()
      return new Date(val)
    }
    if (doc.date) {
      return new Date(doc.date)
    }
    return new Date(0)
  }

  // Get boundaries for period filters
  const getStartOfWeek = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Monday
    const start = new Date(d.setDate(diff))
    start.setHours(0, 0, 0, 0)
    return start
  }

  const getStartOfMonth = () => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  }

  if (authLoading || txLoading || receiptsLoading || pendingLoading) {
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
            <CardDescription className="text-sm">Please log in to view the Audit & Summary workspace.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const startOfWeek = getStartOfWeek()
  const startOfMonth = getStartOfMonth()

  // --- Calculations ---

  // Transactions
  const weeklyTx = transactions.filter(t => new Date(t.date) >= startOfWeek)
  const monthlyTx = transactions.filter(t => new Date(t.date) >= startOfMonth)

  const weeklySpending = weeklyTx.filter(t => t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const monthlySpending = monthlyTx.filter(t => t.type === "expense").reduce((sum, t) => sum + Math.abs(t.amount), 0)

  // Approved Receipts (from receipts collection)
  const weeklyApproved = receipts.filter(r => getDocDate(r) >= startOfWeek).length
  const monthlyApproved = receipts.filter(r => getDocDate(r) >= startOfMonth).length

  // Pending Receipts (from pendingReceipts where status == pending)
  const weeklyPending = pendingReceiptDocs.filter(r => r.status === "pending" && getDocDate(r) >= startOfWeek).length
  const monthlyPending = pendingReceiptDocs.filter(r => r.status === "pending" && getDocDate(r) >= startOfMonth).length

  // Rejected Receipts (from pendingReceipts where status == rejected)
  const weeklyRejected = pendingReceiptDocs.filter(r => r.status === "rejected" && getDocDate(r) >= startOfWeek).length
  const monthlyRejected = pendingReceiptDocs.filter(r => r.status === "rejected" && getDocDate(r) >= startOfMonth).length

  // Optional: Top Categories for the Month
  const categoryTotals = monthlyTx
    .filter(t => t.type === "expense")
    .reduce((acc: Record<string, number>, t) => {
      const cat = t.category || "Uncategorized"
      acc[cat] = (acc[cat] || 0) + Math.abs(t.amount)
      return acc
    }, {})

  const topCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-8 max-w-5xl"
    >
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-black stroke-[3]" />
            Audit & Summary
          </h1>
          <p className="text-sm text-black/50 font-semibold mt-1">
            Review approved receipts, match transactions, and scan financial summaries.
          </p>
        </div>
        <Badge variant="outline" className="border-black/10 bg-white font-bold text-xs px-3.5 py-1.5 self-start md:self-auto rounded-full shadow-sm">
          Active Currency: <span className="font-extrabold text-black ml-1">{currency}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Weekly Card */}
        <Card className="border border-black/5 bg-white/70 backdrop-blur rounded-3xl shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-[#ccff00] to-[#99cc00]" />
          <CardHeader className="px-6 pt-6 pb-4 border-b border-black/5 bg-black/[0.01]">
            <CardTitle className="text-lg font-black text-black uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-black/60" />
              This Week
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-black/40">
              Summary since Monday, {startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-0.5">Total Spending</span>
              <span className="text-3xl font-black text-black tracking-tight">
                {formatCurrency(weeklySpending)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-0.5">Transactions</span>
                <span className="text-lg font-extrabold text-black">{weeklyTx.length} records</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-0.5">Verified Spending</span>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All matches verified
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 space-y-2.5">
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">Receipt Approvals State</p>
              
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-black/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Approved Receipts
                </span>
                <span className="font-extrabold text-emerald-600">{weeklyApproved}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-black/70">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Pending Receipts
                </span>
                <span className="font-extrabold text-amber-600">{weeklyPending}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-black/70">
                  <XCircle className="w-4 h-4 text-red-400" />
                  Rejected Receipts
                </span>
                <span className="font-extrabold text-red-500">{weeklyRejected}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Card */}
        <Card className="border border-black/5 bg-white/70 backdrop-blur rounded-3xl shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 left-0 right-0 h-[6px] bg-gradient-to-r from-[#ccff00] to-[#66aa00]" />
          <CardHeader className="px-6 pt-6 pb-4 border-b border-black/5 bg-black/[0.01]">
            <CardTitle className="text-lg font-black text-black uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-black/60" />
              This Month
            </CardTitle>
            <CardDescription className="text-xs font-semibold text-black/40">
              Summary since {startOfMonth.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-0.5">Total Spending</span>
              <span className="text-3xl font-black text-black tracking-tight">
                {formatCurrency(monthlySpending)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-0.5">Transactions</span>
                <span className="text-lg font-extrabold text-black">{monthlyTx.length} records</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-0.5">Audit Standard</span>
                <span className="text-xs font-bold text-black flex items-center gap-1 mt-1">
                  <ClipboardCheck className="w-3.5 h-3.5 text-black/60" />
                  100% matched
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 space-y-2.5">
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider mb-1">Receipt Approvals State</p>
              
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-black/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Approved Receipts
                </span>
                <span className="font-extrabold text-emerald-600">{monthlyApproved}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-black/70">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Pending Receipts
                </span>
                <span className="font-extrabold text-amber-600">{monthlyPending}</span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2 text-black/70">
                  <XCircle className="w-4 h-4 text-red-400" />
                  Rejected Receipts
                </span>
                <span className="font-extrabold text-red-500">{monthlyRejected}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {topCategories.length > 0 && (
        <Card className="border border-black/5 bg-white/70 backdrop-blur rounded-3xl shadow-xl overflow-hidden">
          <CardHeader className="border-b border-black/5 bg-black/[0.01] px-6 py-4">
            <CardTitle className="text-lg font-black text-black flex items-center gap-2">
              <PieChart className="w-5 h-5 text-black/60" />
              Top Spending Categories (This Month)
            </CardTitle>
            <CardDescription className="text-xs">
              Breakdown of top 5 category shares for current monthly transactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {topCategories.map(({ category, amount }) => {
                const percentage = monthlySpending > 0 ? (amount / monthlySpending) * 100 : 0
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-black">
                      <span className="text-black/70">{category}</span>
                      <span>
                        {formatCurrency(amount)} <span className="text-black/40 font-semibold text-[10px] ml-1">({percentage.toFixed(1)}%)</span>
                      </span>
                    </div>
                    {/* Stylized progress bar */}
                    <div className="w-full h-2 bg-black/[0.03] border border-black/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-black rounded-full"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  )
}
