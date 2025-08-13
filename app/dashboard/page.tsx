"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { StatsCards } from "@/components/stats-cards"
import { RecentTransactions } from "@/components/recent-transactions"
import { TransactionChart } from "@/components/transaction-chart"
import { CategoryChart } from "@/components/category-chart"
import { DashboardSection } from "@/components/dashboard-section"
import { useTransactions } from "@/context/transaction-context"
import { useNotes } from "@/hooks/use-notes"
import { useAuth } from "@/contexts/auth-context"
import { useRole } from "@/contexts/role-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Loader2, Download, FileSpreadsheet, FileText, File } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatCurrency } from "@/utils/currency"
import { exportToExcel, exportToCSV, exportToPDF } from "@/utils/export-utils"

export default function DashboardPage() {
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions()
  const { notes, loading: notesLoading, error: notesError } = useNotes()
  const { users, loading: usersLoading, error: usersError } = useAuth()
  const { permissions } = useRole()

  const loading = transactionsLoading || notesLoading || usersLoading
  const error = transactionsError || notesError || usersError

  const totalExpenses = useMemo(() => {
    return transactions.reduce((sum, t) => sum + t.amount, 0)
  }, [transactions])

  const averageExpense = useMemo(() => {
    return transactions.length > 0 ? totalExpenses / transactions.length : 0
  }, [transactions, totalExpenses])

  const totalNotes = notes.length
  const activeUsers = users.filter((user) => user.isActive).length

  const monthlySpendingData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {}
    transactions.forEach((t) => {
      const monthYear = new Date(t.date).toLocaleString("en-US", { month: "short", year: "2-digit" })
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + t.amount
    })
    return Object.keys(monthlyData)
      .sort((a, b) => {
        const [monthA, yearA] = a.split(" ")
        const [monthB, yearB] = b.split(" ")
        const dateA = new Date(`01 ${monthA} 20${yearA}`)
        const dateB = new Date(`01 ${monthB} 20${yearB}`)
        return dateA.getTime() - dateB.getTime()
      })
      .map((key) => ({ name: key, total: monthlyData[key] }))
  }, [transactions])

  const categorySpendingData = useMemo(() => {
    const categoryData: { [key: string]: number } = {}
    transactions.forEach((t) => {
      categoryData[t.category] = (categoryData[t.category] || 0) + t.amount
    })
    return Object.keys(categoryData).map((key) => ({ name: key, value: categoryData[key] }))
  }, [transactions])

  // Dummy data for activity logs
  const recentLogins = useMemo(() => {
    return users
      .filter((user) => user.lastLogin)
      .sort((a, b) => new Date(b.lastLogin!).getTime() - new Date(a.lastLogin!).getTime())
      .slice(0, 5)
      .map((user) => ({
        timestamp: user.lastLogin!,
        details: `Logged in`,
        user: user.name,
      }))
  }, [users])

  const recentTransactionsActivity = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((t) => ({
        timestamp: t.date,
        details: `Added ${t.title} (${t.category}) for ${formatCurrency(t.amount)}`,
        user: users.find((u) => u.id === t.userId)?.name || "Unknown User",
      }))
  }, [transactions, users])

  const recentReceiptsActivity = useMemo(() => {
    // This would typically come from a receipts context/hook
    // For now, using dummy data or filtering transactions if receipts are linked
    return [] // Placeholder for actual receipt activity
  }, [])

  const handleExportExcel = () => {
    const dashboardData = [
      { Metric: "Total Expenses", Value: formatCurrency(totalExpenses) },
      { Metric: "Average Expense", Value: formatCurrency(averageExpense) },
      { Metric: "Total Notes", Value: totalNotes },
      { Metric: "Active Users", Value: activeUsers },
      { Metric: "Total Transactions", Value: transactions.length },
    ]
    exportToExcel(dashboardData, "dashboard-summary.xlsx")
  }

  const handleExportCSV = () => {
    const dashboardData = [
      { Metric: "Total Expenses", Value: formatCurrency(totalExpenses) },
      { Metric: "Average Expense", Value: formatCurrency(averageExpense) },
      { Metric: "Total Notes", Value: totalNotes },
      { Metric: "Active Users", Value: activeUsers },
      { Metric: "Total Transactions", Value: transactions.length },
    ]
    exportToCSV(dashboardData, "dashboard-summary.csv")
  }

  const handleExportPDF = () => {
    exportToPDF("dashboard-content", "dashboard-summary.pdf")
  }

  if (!permissions.canViewDashboard) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#222831] text-[#EEEEEE]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-[#EEEEEE]/70">You do not have permission to view the Dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 mt-16"
    >
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 space-y-4 md:space-y-0">
        <h1 className="text-4xl font-bold text-[#00ADB5]">Dashboard Overview</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Export Dashboard
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#393E46] border-[#00ADB5]">
            <DropdownMenuItem onClick={handleExportExcel} className="text-[#EEEEEE] hover:bg-[#00ADB5]/20">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export to Excel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportCSV} className="text-[#EEEEEE] hover:bg-[#00ADB5]/20">
              <File className="mr-2 h-4 w-4" />
              Export to CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF} className="text-[#EEEEEE] hover:bg-[#00ADB5]/20">
              <FileText className="mr-2 h-4 w-4" />
              Export to PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] text-[#00ADB5]">
          <Loader2 className="h-12 w-12 animate-spin" />
          <span className="sr-only">Loading dashboard data...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="bg-red-900/20 border-red-700 text-red-400">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div id="dashboard-content">
          <StatsCards
            totalExpenses={totalExpenses}
            averageExpense={averageExpense}
            totalNotes={totalNotes}
            activeUsers={activeUsers}
          />

          <div className="grid gap-6 lg:grid-cols-2 mt-8">
            <RecentTransactions />
            <TransactionChart data={monthlySpendingData} />
            <CategoryChart data={categorySpendingData} />
            <DashboardSection title="Recent Logins" data={recentLogins} type="login" />
            <DashboardSection
              title="Recent Transaction Activity"
              data={recentTransactionsActivity}
              type="transaction"
            />
            <DashboardSection title="Recent Receipt Uploads" data={recentReceiptsActivity} type="receipt" />
          </div>
        </div>
      )}
    </motion.div>
  )
}
