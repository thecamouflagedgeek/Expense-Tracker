"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, NotebookPen, Users, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/utils/format-utils"
import { motion } from "framer-motion"

type StatsCardsProps = {
  totalExpenses: number
  averageExpense: number
  totalNotes: number
  activeUsers: number
}

export function StatsCards({ totalExpenses, averageExpense, totalNotes, activeUsers }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Expenses",
      value: formatCurrency(totalExpenses),
      change: "+20.1% from last month",
      icon: DollarSign,
      color: "from-emerald-500 to-teal-500",
      delay: 0,
    },
    {
      title: "Average Expense",
      value: formatCurrency(averageExpense),
      change: "+5.3% from last month",
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
      delay: 0.1,
    },
    {
      title: "Total Notes",
      value: totalNotes.toString(),
      change: "+15 notes this week",
      icon: NotebookPen,
      color: "from-purple-500 to-pink-500",
      delay: 0.2,
    },
    {
      title: "Active Users",
      value: activeUsers.toString(),
      change: "+2 new users today",
      icon: Users,
      color: "from-orange-500 to-red-500",
      delay: 0.3,
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: card.delay, duration: 0.5 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
        >
          <Card className="stats-card group cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-[#EEEEEE]/80 group-hover:text-[#00ADB5] transition-colors">
                {card.title}
              </CardTitle>
              <div
                className={`p-2 rounded-lg bg-gradient-to-br ${card.color} bg-opacity-20 group-hover:scale-110 transition-transform`}
              >
                <card.icon className="h-4 w-4 text-[#00ADB5] group-hover:text-white transition-colors" />
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-3xl font-bold text-[#EEEEEE] group-hover:text-[#00ADB5] transition-colors">
                {card.value}
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-1 w-12 bg-gradient-to-r from-[#00ADB5] to-[#00C4D4] rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs text-[#EEEEEE]/60 group-hover:text-[#EEEEEE]/80 transition-colors">
                  {card.change}
                </p>
              </div>
            </CardContent>

            {/* Animated background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ADB5]/5 to-[#00C4D4]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Floating particles effect */}
            <div className="absolute top-4 right-4 w-2 h-2 bg-[#00ADB5] rounded-full opacity-20 group-hover:opacity-60 transition-opacity animate-pulse" />
            <div className="absolute bottom-6 left-6 w-1 h-1 bg-[#00C4D4] rounded-full opacity-30 group-hover:opacity-80 transition-opacity animate-pulse delay-300" />
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
