"use client"

import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/utils/format-utils"
import { useCurrency } from "@/context/currency-context"
import { Edit, Trash2, Loader2, TrendingDown } from "lucide-react"
import { useState } from "react"
import { EditTransactionModal } from "./edit-transaction-modal"
import { useTransactions } from "@/context/transaction-context"
import { useRole } from "@/contexts/role-context"

type TransactionItemProps = {
  transaction: {
    id: string
    title: string
    amount: number
    category: string
    date: string
    description?: string
  }
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteTransaction } = useTransactions()
  const { permissions } = useRole()
  const { format } = useCurrency()

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      setIsDeleting(true)
      try {
        await deleteTransaction(transaction.id)
      } catch (error) {
        console.error("Error deleting transaction:", error)
        alert("Failed to delete transaction.")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <TableRow className="border-black/5 hover:bg-black/[0.01] transition-colors">
      <TableCell className="font-bold text-black tracking-tight">{transaction.title}</TableCell>
      <TableCell className="text-black/55 text-xs font-medium">{transaction.description || "-"}</TableCell>
      <TableCell>
        <span className="text-[10px] font-bold text-black/55 bg-black/[0.04] px-2.5 py-1 rounded-full border border-black/[0.05]">
          {transaction.category}
        </span>
      </TableCell>
      <TableCell className="font-black text-black text-sm">
        -{format(transaction.amount)}
      </TableCell>
      <TableCell className="text-black/45 text-xs font-semibold">{formatDate(transaction.date)}</TableCell>
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
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8"
              title="Delete Transaction"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              <span className="sr-only">Delete Transaction</span>
            </Button>
          )}
        </div>
      </TableCell>
      {isEditModalOpen && (
        <EditTransactionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          transaction={transaction}
        />
      )}
    </TableRow>
  )
}
