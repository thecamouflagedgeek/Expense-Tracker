"use client"

import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/utils/format-utils"
import { Edit, Trash2, Loader2 } from "lucide-react"
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
    <TableRow className="border-[#393E46] hover:bg-[#393E46]/50">
      <TableCell className="font-medium text-[#EEEEEE]">{transaction.title}</TableCell>
      <TableCell className="text-[#EEEEEE]/80">{transaction.description}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="bg-[#00ADB5]/20 text-[#00ADB5] border-[#00ADB5]/50">
          {transaction.category}
        </Badge>
      </TableCell>
      <TableCell className="text-[#EEEEEE]">{formatCurrency(transaction.amount)}</TableCell>
      <TableCell className="text-[#EEEEEE]">{formatDate(transaction.date)}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          {permissions.canEditTransactions && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditModalOpen(true)}
              className="text-[#00ADB5] hover:bg-[#00ADB5]/20"
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
              className="text-red-400 hover:bg-red-900/20"
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
