"use client"

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TransactionItem } from "./transaction-item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRole } from "@/contexts/role-context"
import { Button } from "@/components/ui/button"
import { Archive, Undo2, Loader2 } from "lucide-react"
import { useState } from "react"
import { useTransactions } from "@/context/transaction-context"

type TransactionListProps = {
  transactions: any[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const { permissions } = useRole()
  const { updateTransaction } = useTransactions()
  const [archivingItemId, setArchivingItemId] = useState<string | null>(null)

  const handleArchive = async (id: string, currentStatus: boolean) => {
    if (!permissions.canArchiveTransactions) {
      alert("You do not have permission to archive transactions.")
      return
    }
    setArchivingItemId(id)
    try {
      await updateTransaction(id, { isArchived: !currentStatus })
    } catch (err) {
      console.error("Failed to update archive status:", err)
      alert("Failed to update archive status.")
    } finally {
      setArchivingItemId(null)
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center text-black/45 py-12">
        <p className="text-sm font-semibold">No transactions found matching your criteria.</p>
      </div>
    )
  }

  return (
    <Card className="card-gradient border-none p-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-base font-bold text-black tracking-tight">All Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-black/5 hover:bg-transparent">
                <TableHead className="text-black/45 font-bold text-[10px] uppercase tracking-wider">Title</TableHead>
                <TableHead className="text-black/45 font-bold text-[10px] uppercase tracking-wider">Description</TableHead>
                <TableHead className="text-black/45 font-bold text-[10px] uppercase tracking-wider">Category</TableHead>
                <TableHead className="text-black/45 font-bold text-[10px] uppercase tracking-wider">Amount</TableHead>
                <TableHead className="text-black/45 font-bold text-[10px] uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-black/45 font-bold text-[10px] uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction}>
                  {permissions.canArchiveTransactions && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleArchive(transaction.id, transaction.isArchived)}
                      disabled={archivingItemId === transaction.id}
                      className="text-black/50 hover:text-black hover:bg-black/5 rounded-full w-8 h-8"
                      title={transaction.isArchived ? "Unarchive Transaction" : "Archive Transaction"}
                    >
                      {archivingItemId === transaction.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : transaction.isArchived ? (
                        <Undo2 className="h-4 w-4" />
                      ) : (
                        <Archive className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {transaction.isArchived ? "Unarchive Transaction" : "Archive Transaction"}
                      </span>
                    </Button>
                  )}
                </TransactionItem>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
