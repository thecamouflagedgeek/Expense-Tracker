"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTransactions } from "@/context/transaction-context"
import { useCurrency } from "@/context/currency-context"
import { Loader2, Upload, Plus, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"

interface BulkTransaction {
  id: string
  title: string
  amount: string
  type: "income" | "expense"
  category: string
  date: string
  notes: string
  isValid: boolean
}

export function BulkAddModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { addTransaction, categories } = useTransactions()
  const { symbol, convertToINR, currency } = useCurrency()

  const [transactions, setTransactions] = useState<BulkTransaction[]>([
    {
      id: crypto.randomUUID(),
      title: "",
      amount: "",
      type: "expense",
      category: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      isValid: false,
    },
  ])

  const validateTransaction = (transaction: BulkTransaction): boolean => {
    return !!(
      transaction.title.trim() &&
      transaction.amount.trim() &&
      !isNaN(Number(transaction.amount)) &&
      Number(transaction.amount) > 0 &&
      transaction.type &&
      transaction.category.trim()
    )
  }

  const updateTransaction = (id: string, field: keyof BulkTransaction, value: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, [field]: value }
          updated.isValid = validateTransaction(updated)
          return updated
        }
        return t
      }),
    )
  }

  const addRow = () => {
    const newTransaction: BulkTransaction = {
      id: crypto.randomUUID(),
      title: "",
      amount: "",
      type: "expense",
      category: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      isValid: false,
    }
    setTransactions((prev) => [...prev, newTransaction])
  }

  const removeRow = (id: string) => {
    if (transactions.length > 1) {
      setTransactions((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const validTransactionCount = transactions.filter((t) => t.isValid).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const validTransactions = transactions.filter((t) => t.isValid)

      if (validTransactions.length === 0) {
        setError("No valid transactions found. Please fill in all required fields.")
        return
      }

      for (const transaction of validTransactions) {
        const rawAmount = Number(transaction.amount)
        // Convert entered amount from active currency back to base INR for storage
        const amountInINR = currency === "INR" ? rawAmount : convertToINR(rawAmount)
        await addTransaction({
          title: transaction.title.trim(),
          amount: amountInINR,
          type: transaction.type,
          category: transaction.category,
          date: new Date(transaction.date).toISOString(),
          description: transaction.notes.trim(),
        })
      }

      setSuccessMessage(`Successfully added ${validTransactions.length} transactions!`)

      setTransactions([
        {
          id: crypto.randomUUID(),
          title: "",
          amount: "",
          type: "expense",
          category: "",
          date: new Date().toISOString().split("T")[0],
          notes: "",
          isValid: false,
        },
      ])

      setTimeout(() => {
        setIsOpen(false)
        setSuccessMessage(null)
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Failed to add transactions in bulk.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="button-gradient px-5 py-2 h-11 text-xs">
          <Upload className="mr-2 h-4 w-4 text-[#ccff00]" /> Bulk Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] w-[calc(100%-2rem)] sm:w-full max-h-[calc(100vh-2rem)] sm:max-h-[80vh] overflow-y-auto bg-white text-black border border-black/5 rounded-3xl shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-black">Bulk Add Transactions</DialogTitle>
          <DialogDescription className="text-xs text-black/60 font-medium">
            Add multiple transactions at once. Fill in the required fields (marked with *) for each transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-black/45 font-bold uppercase tracking-wider">
                {validTransactionCount} valid transactions ready to add
              </div>
              <Button
                type="button"
                onClick={addRow}
                variant="outline"
                size="sm"
                className="border-black/10 hover:border-black/20 text-black/75 hover:bg-black/5 bg-white text-xs font-bold rounded-xl"
              >
                <Plus className="w-4 h-4 mr-1 text-black/50" />
                Add Row
              </Button>
            </div>

            <div className="grid grid-cols-12 gap-2 text-[10px] uppercase font-black tracking-wider text-black/40 border-b border-black/5 pb-2">
              <div className="col-span-2">Title*</div>
              <div className="col-span-1">Amt* ({symbol})</div>
              <div className="col-span-1">Type*</div>
              <div className="col-span-2">Category*</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Notes</div>
              <div className="col-span-1">Actions</div>
            </div>

            <AnimatePresence>
              {transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`grid grid-cols-12 gap-2 p-2 rounded-lg border items-center ${
                    transaction.isValid ? "border-green-500/10 bg-green-500/5" : "border-black/5 bg-black/[0.01]"
                  }`}
                >
                  <div className="col-span-2">
                    <Input
                      value={transaction.title}
                      onChange={(e) => updateTransaction(transaction.id, "title", e.target.value)}
                      placeholder="Transaction title"
                      className="bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="col-span-1">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={transaction.amount}
                      onChange={(e) => updateTransaction(transaction.id, "amount", e.target.value)}
                      placeholder="0.00"
                      className="bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="col-span-1">
                    <Select
                      value={transaction.type}
                      onValueChange={(value) => updateTransaction(transaction.id, "type", value)}
                    >
                      <SelectTrigger className="bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black border border-black/5 rounded-xl shadow-xl z-[999]">
                        <SelectItem value="income" className="hover:bg-black/5 focus:bg-black/5 cursor-pointer font-semibold text-xs py-2 px-3">Income</SelectItem>
                        <SelectItem value="expense" className="hover:bg-black/5 focus:bg-black/5 cursor-pointer font-semibold text-xs py-2 px-3">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Select
                      value={transaction.category}
                      onValueChange={(value) => updateTransaction(transaction.id, "category", value)}
                    >
                      <SelectTrigger className="bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white text-black border border-black/5 rounded-xl shadow-xl z-[999]">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category} className="hover:bg-black/5 focus:bg-black/5 cursor-pointer font-semibold text-xs py-2 px-3">
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="date"
                      value={transaction.date}
                      onChange={(e) => updateTransaction(transaction.id, "date", e.target.value)}
                      className="bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="col-span-3">
                    <Input
                      value={transaction.notes}
                      onChange={(e) => updateTransaction(transaction.id, "notes", e.target.value)}
                      placeholder="Optional notes"
                      className="bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10"
                    />
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      onClick={() => removeRow(transaction.id)}
                      variant="ghost"
                      size="sm"
                      disabled={transactions.length === 1}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200 text-red-700 rounded-2xl p-4 shadow-sm">
              <AlertTitle className="font-bold">Error</AlertTitle>
              <AlertDescription className="text-xs mt-0.5">{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mt-4 bg-emerald-50 border-emerald-200 text-emerald-800 rounded-2xl p-4 shadow-sm">
              <AlertTitle className="font-bold">Success!</AlertTitle>
              <AlertDescription className="text-xs mt-0.5">{successMessage}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-6">
            <Button type="submit" className="button-gradient px-6 py-2.5 h-11 text-xs" disabled={loading || validTransactionCount === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#ccff00]" /> Adding...
                </>
              ) : (
                `Add ${validTransactionCount} Transactions`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
