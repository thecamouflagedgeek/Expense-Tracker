"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { useTransactions } from "@/hooks/use-transactions"
import { TransactionList } from "@/components/transaction-list"
import { TransactionFilters } from "@/components/transaction-filters"
import { AddTransactionModal } from "@/components/add-transaction-modal"
import { BulkAddModal } from "@/components/bulk-add-modal"
import { exportTransactionsToExcel, exportTransactionsToCSV } from "@/utils/export-utils"
import { generateTransactionsPdf } from "@/utils/pdf-utils"
import { useRole } from "@/contexts/role-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Lock, AlertTriangle, Download, FileSpreadsheet, FileText, File } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default function TransactionsPage() {
  const { transactions, categories, loading, error } = useTransactions()
  const { permissions, isAccountActive } = useRole()

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    startDate: undefined,
    endDate: undefined,
  })

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const filteredTransactions = useMemo(() => {
    let filtered = transactions

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
      filtered = filtered.filter((t) => new Date(t.date) >= filters.startDate!)
    }

    if (filters.endDate) {
      filtered = filtered.filter((t) => new Date(t.date) <= filters.endDate!)
    }

    return filtered
  }, [transactions, filters])

  const handleExportExcel = () => {
    exportTransactionsToExcel(filteredTransactions)
  }

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTransactions)
  }

  const handleExportPDF = () => {
    generateTransactionsPdf(filteredTransactions)
  }

  if (!isAccountActive) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#222831] text-[#EEEEEE]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-orange-400 mb-2">Account Inactive</h2>
          <p className="text-[#EEEEEE]/70 mb-4">
            Your account has been deactivated by an administrator. Please contact support to reactivate your account.
          </p>
          <div className="text-sm text-[#EEEEEE]/50">
            If you believe this is an error, please reach out to your system administrator.
          </div>
        </motion.div>
      </div>
    )
  }

  if (!permissions.canViewTransactions) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#222831] text-[#EEEEEE]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-[#EEEEEE]/70 mb-4">
            You do not have permission to view transactions. Your access has been restricted by an administrator.
          </p>
          <div className="text-sm text-[#EEEEEE]/50">
            Contact your administrator if you need access to this feature.
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 mt-16"
    >
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
        <h1 className="text-4xl font-bold text-[#00ADB5]">Transactions</h1>
        <div className="flex flex-wrap justify-center gap-4">
          {permissions.canAddTransactions && <AddTransactionModal />}
          {permissions.canAddTransactions && <BulkAddModal />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#393E46] border-[#00ADB5]">
              <DropdownMenuItem onClick={handleExportExcel} className="text-[#EEEEEE] hover:bg-[#00ADB5]/20">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV} className="text-[#EEEEEE] hover:bg-[#00ADB5]/20">
                <File className="mr-2 h-4 w-4" />
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} className="text-[#EEEEEE] hover:bg-[#00ADB5]/20">
                <FileText className="mr-2 h-4 w-4" />
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {(!permissions.canEditTransactions || !permissions.canAddTransactions) && (
        <Alert className="bg-orange-900/20 border-orange-700 text-orange-400 mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limited Access</AlertTitle>
          <AlertDescription>
            {!permissions.canEditTransactions && !permissions.canAddTransactions
              ? "You have read-only access to transactions. Contact an administrator to request editing permissions."
              : !permissions.canEditTransactions
                ? "You can add new transactions but cannot edit existing ones."
                : "You can edit transactions but cannot add new ones."}
          </AlertDescription>
        </Alert>
      )}

      <TransactionFilters filters={filters} onFilterChange={handleFilterChange} categories={categories} />

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] text-[#00ADB5]">
          <Loader2 className="h-12 w-12 animate-spin" />
          <span className="sr-only">Loading transactions...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="bg-red-900/20 border-red-700 text-red-400">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <TransactionList transactions={filteredTransactions} />
      )}
    </motion.div>
  )
}
