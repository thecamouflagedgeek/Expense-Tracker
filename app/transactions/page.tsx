"use client"

import { useState, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useTransactions } from "@/context/transaction-context"
import { TransactionList } from "@/components/transaction-list"
import { TransactionFilters } from "@/components/transaction-filters"
import { AddTransactionModal } from "@/components/add-transaction-modal"
import { BulkAddModal } from "@/components/bulk-add-modal"
import { ReceiptUploadModal } from "@/components/receipt-upload-modal"
import { UploadDriveModal } from "@/components/upload-drive-modal"
import { ReceiptsPanel } from "@/components/receipts-panel"
import { exportTransactionsToExcel, exportTransactionsToCSV } from "@/utils/export-utils"
import { generateTransactionsPdf } from "@/utils/pdf-utils"
import { useRole } from "@/contexts/role-context"
import { useCurrency } from "@/context/currency-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Lock, AlertTriangle, Download, FileSpreadsheet, FileText, File } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

type Filters = {
  search: string
  category: string
  startDate: Date | undefined
  endDate: Date | undefined
}

export default function TransactionsPage() {
  const { transactions, categories, loading, error } = useTransactions()
  const { permissions, isAccountActive } = useRole()
  const { format } = useCurrency()
  const search = useSearchParams()
  const router = useRouter()

  const tab = useMemo<"transactions" | "receipts">(() => {
    const t = search.get("tab")
    if (t === "receipts" && permissions.canViewReceipts) {
      return "receipts"
    }
    return "transactions"
  }, [search, permissions.canViewReceipts])

  const view = useMemo<"active" | "archived">(() => {
    const v = search.get("view")
    return v === "archived" ? "archived" : "active"
  }, [search])

  const setTab = (next: "transactions" | "receipts") => {
    const p = new URLSearchParams(search.toString())
    p.set("tab", next)
    router.replace(`/transactions?${p.toString()}`)
  }

  const setView = (next: "active" | "archived") => {
    const p = new URLSearchParams(search.toString())
    p.set("view", next)
    router.replace(`/transactions?${p.toString()}`)
  }

  const [filters, setFilters] = useState<Filters>({
    search: "",
    category: "all",
    startDate: undefined,
    endDate: undefined,
  })

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((t) => Boolean(t.isArchived) === (view === "archived"))

    if (filters.search) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          t.description?.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    if (filters.category !== "all") {
      filtered = filtered.filter((t) => t.category === filters.category)
    }

    if (filters.startDate) {
      filtered = filtered.filter((t) => new Date(t.date) >= (filters.startDate as Date))
    }

    if (filters.endDate) {
      filtered = filtered.filter((t) => new Date(t.date) <= (filters.endDate as Date))
    }

    return filtered
  }, [transactions, filters, view])

  const handleExportExcel = () => {
    exportTransactionsToExcel(filteredTransactions, format)
  }

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTransactions, format)
  }

  const handleExportPDF = () => {
    generateTransactionsPdf(filteredTransactions, format)
  }

  if (!isAccountActive) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#eff1e9] text-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8 bg-white border border-black/5 rounded-3xl shadow-xl"
        >
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-black text-orange-600 mb-2">Account Inactive</h2>
          <p className="text-black/60 text-sm mb-4">
            Your account has been deactivated by an administrator. Please contact support to reactivate your account.
          </p>
          <div className="text-xs text-black/40 font-semibold">
            If you believe this is an error, please reach out to your system administrator.
          </div>
        </motion.div>
      </div>
    )
  }

  if (!permissions.canViewTransactions) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#eff1e9] text-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8 bg-white border border-black/5 rounded-3xl shadow-xl"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-red-500 mb-2">Access Denied</h2>
          <p className="text-black/60 text-sm mb-4">
            You do not have permission to view transactions. Your access has been restricted by an administrator.
          </p>
          <div className="text-xs text-black/40 font-semibold">
            Contact your administrator if you need access to this feature.
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-8"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-black tracking-tight text-black">Finance Hub</h1>
        <div className="flex flex-wrap items-center gap-3">
          {tab === "transactions" ? (
            <>
              {permissions.canAddTransactions && <AddTransactionModal />}
              {permissions.canAddTransactions && <BulkAddModal />}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="button-gradient px-5 py-2 h-11 text-xs">
                    <Download className="mr-2 h-4 w-4 text-[#ccff00]" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border-black/5 text-black rounded-xl shadow-xl z-50">
                  <DropdownMenuItem onClick={handleExportExcel} className="text-xs py-2 px-3 hover:bg-black/5 cursor-pointer font-semibold">
                    <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                    Export to Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCSV} className="text-xs py-2 px-3 hover:bg-black/5 cursor-pointer font-semibold">
                    <File className="mr-2 h-4 w-4 text-sky-600" />
                    Export to CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF} className="text-xs py-2 px-3 hover:bg-black/5 cursor-pointer font-semibold">
                    <FileText className="mr-2 h-4 w-4 text-rose-600" />
                    Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              {permissions.canUploadReceipts && <ReceiptUploadModal />}
              {permissions.canUploadToDrive && <UploadDriveModal />}
            </>
          )}
        </div>
      </div>

      {/* Modern Pill Tabs */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex bg-white/70 p-1.5 rounded-full border border-black/5 shadow-sm self-start w-fit">
          <button
            onClick={() => setTab("transactions")}
            className={`px-5 py-2 rounded-full text-xs font-black transition-all duration-200 ${
              tab === "transactions" 
                ? "bg-black text-[#ccff00] shadow-sm" 
                : "text-black/50 hover:text-black"
            }`}
          >
            Transactions
          </button>
          {permissions.canViewReceipts && (
            <button
              onClick={() => setTab("receipts")}
              className={`px-5 py-2 rounded-full text-xs font-black transition-all duration-200 ${
                tab === "receipts" 
                  ? "bg-black text-[#ccff00] shadow-sm" 
                  : "text-black/50 hover:text-black"
              }`}
            >
              Receipts
            </button>
          )}
        </div>
        {tab === "transactions" && (
          <div className="flex bg-white/70 p-1.5 rounded-full border border-black/5 shadow-sm self-start w-fit">
            <button
              onClick={() => setView("active")}
              className={`px-5 py-2 rounded-full text-xs font-black transition-all duration-200 ${
                view === "active" ? "bg-black text-[#ccff00] shadow-sm" : "text-black/50 hover:text-black"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setView("archived")}
              className={`px-5 py-2 rounded-full text-xs font-black transition-all duration-200 ${
                view === "archived" ? "bg-black text-[#ccff00] shadow-sm" : "text-black/50 hover:text-black"
              }`}
            >
              Archived
            </button>
          </div>
        )}
      </div>

      {(!permissions.canEditTransactions || !permissions.canAddTransactions) && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-800 rounded-2xl p-4 mb-6 shadow-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="font-bold">Limited Access</AlertTitle>
          <AlertDescription className="text-xs mt-0.5">
            {!permissions.canEditTransactions && !permissions.canAddTransactions
              ? "You have read-only access to transactions. Contact an administrator to request editing permissions."
              : !permissions.canEditTransactions
                ? "You can add new transactions but cannot edit existing ones."
                : "You can edit transactions but cannot add new ones."}
          </AlertDescription>
        </Alert>
      )}

      {tab === "transactions" && (
        <>
          <TransactionFilters filters={filters} onFilterChange={handleFilterChange} categories={categories} />
          {loading ? (
            <div className="flex items-center justify-center h-48 text-black">
              <Loader2 className="h-6 w-6 animate-spin text-black" />
              <span className="sr-only">Loading transactions...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center text-black/45 font-semibold py-12 bg-white border border-black/5 rounded-3xl shadow-sm">
              <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-3">
                <FileText className="h-5 w-5 text-black/40" />
              </div>
              <p className="text-sm font-bold">No transactions found.</p>
              <p className="text-xs text-black/40 mt-1">Try adjusting filters or add a new transaction.</p>
            </div>
          ) : (
            <TransactionList transactions={filteredTransactions} />
          )}
        </>
      )}

      {tab === "receipts" && <ReceiptsPanel />}
    </motion.div>
  )
}
