"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useTransactions } from "@/context/transaction-context"
import { formatCurrency, formatDate } from "@/utils/format-utils"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function RecentTransactions() {
  const { transactions, loading, error } = useTransactions()

  const recentTransactions = transactions.slice(0, 5) // Get top 5 recent transactions

  return (
    <Card className="card-gradient border-[#393E46]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl text-[#00ADB5]">Recent Transactions</CardTitle>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
        >
          <Link href="/transactions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-40 text-[#00ADB5]">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="sr-only">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 h-40 flex items-center justify-center">
            <p>Error loading recent transactions: {error}</p>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center text-[#EEEEEE]/70 h-40 flex items-center justify-center">
            <p>No recent transactions found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[#393E46]">
                <TableHead className="text-[#00ADB5]">Title</TableHead>
                <TableHead className="text-[#00ADB5]">Category</TableHead>
                <TableHead className="text-[#00ADB5]">Amount</TableHead>
                <TableHead className="text-[#00ADB5]">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-[#393E46] hover:bg-[#393E46]/50">
                  <TableCell className="font-medium text-[#EEEEEE]">{transaction.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-[#00ADB5]/20 text-[#00ADB5] border-[#00ADB5]/50">
                      {transaction.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#EEEEEE]">{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell className="text-[#EEEEEE]">{formatDate(transaction.date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
