"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions } from "@/context/transaction-context"
import { useCurrency } from "@/context/currency-context"
import { formatDate } from "@/utils/format-utils"
import { 
  Loader2, 
  Twitch, 
  Dribbble, 
  Home, 
  Wallet,
  CreditCard,
  ArrowLeftRight,
  TrendingDown
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function RecentTransactions() {
  const { transactions, loading, error } = useTransactions()
  const { format } = useCurrency()

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // Helper to get custom brand styles and icons
  const getBrandDetails = (title: string, category: string) => {
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes("paypal")) {
      return {
        icon: <Wallet className="w-5 h-5" />,
        bgColor: "bg-[#003087]/8 text-[#003087] border-[#003087]/15",
        brandName: "PayPal",
        subtext: "Online Transfer"
      }
    }
    if (lowerTitle.includes("twitch")) {
      return {
        icon: <Twitch className="w-5 h-5" />,
        bgColor: "bg-[#6441A5]/8 text-[#6441A5] border-[#6441A5]/15",
        brandName: "Twitch",
        subtext: "Subscription"
      }
    }
    if (lowerTitle.includes("airbnb")) {
      return {
        icon: <Home className="w-5 h-5" />,
        bgColor: "bg-[#FF5A5F]/8 text-[#FF5A5F] border-[#FF5A5F]/15",
        brandName: "Airbnb",
        subtext: "Lodging & Stays"
      }
    }
    if (lowerTitle.includes("dribbble")) {
      return {
        icon: <Dribbble className="w-5 h-5" />,
        bgColor: "bg-[#EA4C89]/8 text-[#EA4C89] border-[#EA4C89]/15",
        brandName: "Dribbble",
        subtext: "Pro Subscription"
      }
    }
    if (category.toLowerCase() === "transfer" || lowerTitle.includes("transfer")) {
      return {
        icon: <ArrowLeftRight className="w-5 h-5" />,
        bgColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
        brandName: title,
        subtext: "Quick Transfer"
      }
    }

    // Fallbacks
    return {
      icon: <CreditCard className="w-5 h-5" />,
      bgColor: "bg-black/5 text-black border-black/10",
      brandName: title,
      subtext: category
    }
  }

  return (
    <Card className="card-gradient border-none p-6">
      <CardHeader className="p-0 flex flex-row items-center justify-between mb-6">
        <CardTitle className="text-base font-bold text-black tracking-tight">Recent Transactions</CardTitle>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-black/50 hover:text-black hover:bg-black/5 rounded-full font-bold text-[10px] uppercase tracking-wider px-3"
        >
          <Link href="/transactions">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-[#ccff00]">
            <Loader2 className="h-8 w-8 animate-spin text-black" />
            <span className="sr-only">Loading transactions...</span>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 h-48 flex items-center justify-center text-xs">
            <p>Error loading recent transactions: {error}</p>
          </div>
        ) : recentTransactions.length === 0 ? (
          <div className="text-center text-black/45 h-48 flex items-center justify-center text-xs">
            <p>No recent transactions found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentTransactions.map((transaction) => {
              const brand = getBrandDetails(transaction.title, transaction.category)
              return (
                <Link
                  key={transaction.id}
                  href="/transactions"
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-black/[0.02] border border-transparent hover:border-black/[0.03] transition-all duration-200"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Rounded Square brand icon */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-sm ${brand.bgColor}`}>
                      {brand.icon}
                    </div>
                    {/* Titles */}
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-black tracking-tight leading-tight">
                        {brand.brandName}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold text-black/45 bg-black/5 px-2 py-0.5 rounded-full">
                          {transaction.category}
                        </span>
                        <span className="text-[9px] font-semibold text-black/35">
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Amount (Negative prefixed for expenses) */}
                  <div className="flex flex-col items-end">
                    <span className="font-black text-sm text-black tracking-tight">
                      -{format(transaction.amount)}
                    </span>
                    <span className="text-[9px] font-semibold text-black/30 mt-0.5 flex items-center gap-0.5">
                      <TrendingDown className="w-2.5 h-2.5 text-red-500" /> Expense
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
