"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatDate } from "@/utils/format-utils"
import { useCurrency } from "@/context/currency-context"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import { EditTransactionModal } from "./edit-transaction-modal"
import { useTransactions } from "@/context/transaction-context"
import { useRole } from "@/contexts/role-context"
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

type TransactionItemProps = {
  transaction: {
    id: string
    title: string
    amount: number
    type?: "income" | "expense"
    category: string
    date: string
    description?: string
    isArchived?: boolean
  }
  showActions?: boolean
  children?: React.ReactNode
}

export function TransactionItem({ transaction, showActions = true, children }: TransactionItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { deleteTransaction } = useTransactions()
  const { permissions } = useRole()
  const { format } = useCurrency()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteTransaction(transaction.id)
    } catch (error) {
      console.error("Error deleting transaction:", error)
      alert("Failed to delete transaction.")
    } finally {
      setIsDeleting(false)
      setConfirmOpen(false)
    }
  }

  const getCategoryStyles = (category: string) => {
    const lower = category.toLowerCase()
    if (lower === "transfer") return "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
    if (lower === "bills") return "bg-blue-500/10 text-blue-700 border-blue-500/20"
    if (lower === "home goods") return "bg-orange-500/10 text-orange-700 border-orange-500/20"
    if (lower === "sporting goods") return "bg-purple-500/10 text-purple-700 border-purple-500/20"
    if (lower === "other") return "bg-black/5 text-black border-black/10"
    return "bg-black/5 text-black border-black/10"
  }

  return (
    <>
    <TableRow className={`border-black/5 hover:bg-black/[0.01] transition-colors ${transaction.isArchived ? "opacity-60" : ""}`}>
      <TableCell className="font-bold text-black tracking-tight">{transaction.title}</TableCell>
      <TableCell className="text-black/55 text-xs font-medium">{transaction.description || "-"}</TableCell>
      <TableCell>
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${getCategoryStyles(transaction.category)}`}>
          {transaction.category}
        </span>
      </TableCell>
      <TableCell className={`font-black text-sm ${transaction.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
        {transaction.type === "income" ? "+" : "-"}{format(Math.abs(transaction.amount))}
      </TableCell>
      <TableCell className="text-black/45 text-xs font-semibold">{formatDate(transaction.date)}</TableCell>
      {showActions && (
        <TableCell className="text-right">
          <div className="flex justify-end space-x-1.5">
            {permissions.canEditTransactions && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditModalOpen(true)}
                className="text-black/50 hover:text-black hover:bg-black/5 rounded-full w-8 h-8"
                title="Edit Transaction"
              >
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit Transaction</span>
              </Button>
            )}
            {permissions.canDeleteTransactions && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setConfirmOpen(true)}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8"
                title="Delete Transaction"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span className="sr-only">Delete Transaction</span>
              </Button>
            )}
            {children}
          </div>
        </TableCell>
      )}
      {isEditModalOpen && (
        <EditTransactionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          transaction={transaction}
        />
      )}
    </TableRow>
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent className="bg-white text-black border border-black/5 rounded-3xl shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-black">Delete transaction?</AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-black/60">
            This removes the transaction permanently. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700 text-white text-xs"
            onClick={handleDelete}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}
