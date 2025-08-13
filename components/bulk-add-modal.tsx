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
import { useTransactions } from "@/hooks/use-transactions"
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
        await addTransaction({
          title: transaction.title.trim(),
          amount: Number(transaction.amount),
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
        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
          <Upload className="mr-2 h-4 w-4" /> Bulk Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto bg-[#222831] text-[#EEEEEE] border-[#00ADB5]">
        <DialogHeader>
          <DialogTitle className="text-[#00ADB5]">Bulk Add Transactions</DialogTitle>
          <DialogDescription className="text-[#EEEEEE]/70">
            Add multiple transactions at once. Fill in the required fields (marked with *) for each transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#00ADB5] font-medium">
                {validTransactionCount} valid transactions ready to add
              </div>
              <Button
                type="button"
                onClick={addRow}
                variant="outline"
                size="sm"
                className="border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5]/10 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Row
              </Button>
            </div>

            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-[#EEEEEE]/70 border-b border-[#393E46] pb-2">
              <div className="col-span-2">Title*</div>
              <div className="col-span-1">Amount*</div>
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
                  className={`grid grid-cols-12 gap-2 p-2 rounded-lg border ${
                    transaction.isValid ? "border-green-500/30 bg-green-500/5" : "border-[#393E46] bg-[#393E46]/20"
                  }`}
                >
                  <div className="col-span-2">
                    <Input
                      value={transaction.title}
                      onChange={(e) => updateTransaction(transaction.id, "title", e.target.value)}
                      placeholder="Transaction title"
                      className="bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] text-sm"
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
                      className="bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] text-sm"
                    />
                  </div>

                  <div className="col-span-1">
                    <Select
                      value={transaction.type}
                      onValueChange={(value) => updateTransaction(transaction.id, "type", value)}
                    >
                      <SelectTrigger className="bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#393E46] border-[#00ADB5]">
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Select
                      value={transaction.category}
                      onValueChange={(value) => updateTransaction(transaction.id, "category", value)}
                    >
                      <SelectTrigger className="bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#393E46] border-[#00ADB5]">
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
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
                      className="bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] text-sm"
                    />
                  </div>

                  <div className="col-span-3">
                    <Input
                      value={transaction.notes}
                      onChange={(e) => updateTransaction(transaction.id, "notes", e.target.value)}
                      placeholder="Optional notes"
                      className="bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] text-sm"
                    />
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <Button
                      type="button"
                      onClick={() => removeRow(transaction.id)}
                      variant="ghost"
                      size="sm"
                      disabled={transactions.length === 1}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4 bg-red-900/20 border-red-700 text-red-400">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mt-4 bg-green-900/20 border-green-700 text-green-400">
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="mt-6">
            <Button type="submit" className="button-gradient" disabled={loading || validTransactionCount === 0}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
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
