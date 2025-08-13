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
      <div className="text-center text-[#EEEEEE]/70 py-8">
        <p>No transactions found matching your criteria.</p>
      </div>
    )
  }

  return (
    <Card className="card-gradient border-[#393E46]">
      <CardHeader>
        <CardTitle className="text-xl text-[#00ADB5]">All Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-[#393E46]">
                <TableHead className="text-[#00ADB5]">Title</TableHead>
                <TableHead className="text-[#00ADB5]">Description</TableHead>
                <TableHead className="text-[#00ADB5]">Category</TableHead>
                <TableHead className="text-[#00ADB5]">Amount</TableHead>
                <TableHead className="text-[#00ADB5]">Date</TableHead>
                <TableHead className="text-[#00ADB5] text-right">Actions</TableHead>
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
                      className="text-[#00ADB5] hover:bg-[#00ADB5]/20"
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
