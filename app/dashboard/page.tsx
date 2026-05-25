"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RecentTransactions } from "@/components/recent-transactions";
import { TransactionChart } from "@/components/transaction-chart";
import { CategoryChart } from "@/components/category-chart";
import { useTransactions } from "@/context/transaction-context";
import { useNotes } from "@/hooks/use-notes";
import { useAuth } from "@/contexts/auth-context";
import { useRole } from "@/contexts/role-context";
import { useCurrency } from "@/context/currency-context";
import { useNotification } from "@/contexts/notification-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Download,
  FileSpreadsheet,
  FileText,
  File,
  Wifi,
  ArrowRight,
  Sparkles,
  Users,
  Briefcase,
  ClipboardList,
  Archive,
  Activity,
  UserCog,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  exportToExcel,
  exportToCSV,
  exportToPDF,
  exportDashboardSummaryPDF,
} from "@/utils/export-utils";

export default function DashboardPage() {
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
  } = useTransactions();
  const { notes, loading: notesLoading, error: notesError } = useNotes();
  const { users, loading: usersLoading, error: usersError } = useAuth();
  const { permissions, currentRole } = useRole();
  const { format } = useCurrency();
  const { addNotification } = useNotification();

  const allocationBaseInINR = 300000;

  const search = useSearchParams();
  const router = useRouter();
  const view = (search.get("view") === "archived" ? "archived" : "active") as
    | "active"
    | "archived";

  const activeTransactions = useMemo(() => {
    return transactions.filter((t) => !t.isArchived);
  }, [transactions]);

  const archivedTransactions = useMemo(() => {
    return transactions.filter((t) => Boolean(t.isArchived));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return view === "archived" ? archivedTransactions : activeTransactions;
  }, [activeTransactions, archivedTransactions, view]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  }, [filteredTransactions]);

  const loading = transactionsLoading || notesLoading || usersLoading;
  const error = transactionsError || notesError || usersError;

  const totalExpenses = useMemo(() => {
    return totalExpense;
  }, [totalExpense]);

  const totalActiveExpenses = useMemo(() => {
    return activeTransactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  }, [activeTransactions]);

  const averageExpense = useMemo(() => {
    return filteredTransactions.length > 0
      ? totalExpenses / filteredTransactions.length
      : 0;
  }, [filteredTransactions, totalExpenses]);

  const totalNotes = notes.length;
  const archivedNotes = notes.filter((note) => note.isArchived).length;
  const activeUsers = users.filter((user) => user.isActive).length;
  const pendingUsers = users.filter((user) => !user.isActive);

  const workspaceAllocation = allocationBaseInINR * Math.max(activeUsers, 1);
  const workspaceRemaining = Math.max(
    0,
    workspaceAllocation + totalIncome - totalExpense,
  );
  const transferCount = activeTransactions.filter(
    (t) => t.category.toLowerCase() === "transfer",
  ).length;

  const recentActivity = useMemo(() => {
    const noteItems = notes.map((note) => ({
      type: "note",
      title: note.title,
      timestamp: note.updatedAt,
      meta: note.isArchived ? "Archived" : "Updated",
    }));
    const transactionItems = activeTransactions.map((transaction) => ({
      type: "transaction",
      title: transaction.title,
      timestamp: transaction.date,
      meta: format(transaction.amount),
    }));

    return [...noteItems, ...transactionItems]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 6);
  }, [activeTransactions, notes, format]);

  const monthlySpendingData = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    filteredTransactions.forEach((t) => {
      const monthYear = new Date(t.date).toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      });
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + t.amount;
    });
    return Object.keys(monthlyData)
      .sort((a, b) => {
        const [monthA, yearA] = a.split(" ");
        const [monthB, yearB] = b.split(" ");
        const dateA = new Date(`01 ${monthA} 20${yearA}`);
        const dateB = new Date(`01 ${monthB} 20${yearB}`);
        return dateA.getTime() - dateB.getTime();
      })
      .map((key) => ({ name: key, total: monthlyData[key] }));
  }, [filteredTransactions]);

  const categorySpendingData = useMemo(() => {
    const categoryData: { [key: string]: number } = {};
    filteredTransactions.forEach((t) => {
      if (t.type !== "expense") return;
      categoryData[t.category] =
        (categoryData[t.category] || 0) + Math.abs(t.amount);
    });
    return Object.keys(categoryData).map((key) => ({
      name: key,
      value: categoryData[key],
    }));
  }, [filteredTransactions]);

  const handleExportExcel = () => {
    const dashboardData = [
      { Metric: "Total Expenses", Value: format(totalExpenses) },
      { Metric: "Average Expense", Value: format(averageExpense) },
      { Metric: "Total Notes", Value: totalNotes },
      { Metric: "Active Users", Value: activeUsers },
      { Metric: "Total Transactions", Value: transactions.length },
    ];
    exportToExcel(dashboardData, "dashboard-summary.xlsx");
  };

  const handleExportCSV = () => {
    const dashboardData = [
      { Metric: "Total Expenses", Value: format(totalExpenses) },
      { Metric: "Average Expense", Value: format(averageExpense) },
      { Metric: "Total Notes", Value: totalNotes },
      { Metric: "Active Users", Value: activeUsers },
      { Metric: "Total Transactions", Value: transactions.length },
    ];
    exportToCSV(dashboardData, "dashboard-summary.csv");
  };

  const handleExportPDF = () => {
    const incomeCount = filteredTransactions.filter((t) => t.type === "income").length
    const expenseCount = filteredTransactions.filter((t) => t.type === "expense").length

    const dashboardMetrics = {
      totalExpenses,
      totalIncome,
      averageExpense,
      totalTransactions: filteredTransactions.length,
      totalNotes,
      activeUsers,
      pendingUsers: pendingUsers.length,
      workspaceAllocation,
      workspaceRemaining,
      categorySpendingData,
      transferCount,
      incomeCount,
      expenseCount,
    }

    exportDashboardSummaryPDF(dashboardMetrics, format, "dashboard-summary.pdf")
  };

  if (!permissions.canViewDashboard) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#eff1e9] text-black">
        <div className="text-center p-8 bg-white border border-black/5 rounded-3xl shadow-xl max-w-md">
          <h2 className="text-2xl font-black text-red-500 mb-2">
            Access Denied
          </h2>
          <p className="text-black/60 text-sm">
            You do not have permission to view the Dashboard.
          </p>
        </div>
      </div>
    );
  }

  const isAdminView = currentRole === "owner";

  const handleSupportAction = (label: string) => {
    addNotification({
      message: `${label} is ready for deeper backend tooling.`,
      type: "info",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 md:px-8 pt-6 md:pt-8 lg:pt-10 pb-8"
    >
      {/* 1. TOP HEADER ACTION ROW */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 md:mb-8 gap-4">
        {/* Toggle Pill Button */}
        <div className="flex w-full md:w-auto bg-white/70 p-1.5 rounded-full border border-black/5 shadow-sm">
          <button
            onClick={() => router.replace("/dashboard?view=active")}
            className={`flex-1 md:flex-none px-5 py-2 rounded-full text-xs font-black transition-all duration-200 ${
              view === "active"
                ? "bg-black text-[#ccff00] shadow-sm"
                : "text-black/50 hover:text-black"
            }`}
          >
            Active accounts
          </button>
          <button
            onClick={() => router.replace("/dashboard?view=archived")}
            className={`flex-1 md:flex-none px-5 py-2 rounded-full text-xs font-black transition-all duration-200 ${
              view === "archived"
                ? "bg-black text-[#ccff00] shadow-sm"
                : "text-black/50 hover:text-black"
            }`}
          >
            Archived
          </button>
        </div>

        {/* Export Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="button-gradient w-full md:w-auto px-6 py-2 h-11 text-xs">
              <Download className="mr-2 h-4 w-4 text-[#ccff00]" />
              Export Dashboard
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white border-black/5 text-black rounded-xl shadow-xl z-50">
            <DropdownMenuItem
              onClick={handleExportExcel}
              className="text-xs py-2 px-3 hover:bg-black/5 cursor-pointer font-semibold"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
              Export to Excel
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportCSV}
              className="text-xs py-2 px-3 hover:bg-black/5 cursor-pointer font-semibold"
            >
              <File className="mr-2 h-4 w-4 text-sky-600" />
              Export to CSV
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleExportPDF}
              className="text-xs py-2 px-3 hover:bg-black/5 cursor-pointer font-semibold"
            >
              <FileText className="mr-2 h-4 w-4 text-rose-600" />
              Export to PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px] text-black">
          <Loader2 className="h-12 w-12 animate-spin text-[#ccff00]" />
          <span className="sr-only">Loading dashboard data...</span>
        </div>
      ) : error ? (
        <Alert
          variant="destructive"
          className="bg-red-50 border-red-200 text-red-700 rounded-2xl shadow-md p-5"
        >
          <AlertTitle className="font-bold">Error loading Dashboard</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      ) : isAdminView ? (
        <div
          id="dashboard-content"
          className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8 items-start"
        >
          {/* Workspace Summary */}
          <div className="xl:col-span-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card className="card-gradient border-none p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                    Workspace Health
                  </p>
                  <p className="text-2xl font-black text-black mt-2">
                    {format(workspaceAllocation)}
                  </p>
                  <p className="text-[10px] font-semibold text-black/40 mt-2">
                    Estimated runway {format(workspaceRemaining)}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-black/60" />
                </div>
              </div>
            </Card>
            <Card className="card-gradient border-none p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-black text-black mt-2">
                    {format(totalActiveExpenses)}
                  </p>
                  <p className="text-[10px] font-semibold text-black/40 mt-2">
                    {activeTransactions.length} transactions
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-black/60" />
                </div>
              </div>
            </Card>
            <Card className="card-gradient border-none p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                    Active Members
                  </p>
                  <p className="text-2xl font-black text-black mt-2">
                    {activeUsers}
                  </p>
                  <p className="text-[10px] font-semibold text-black/40 mt-2">
                    {pendingUsers.length} needs support
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                  <Users className="w-5 h-5 text-black/60" />
                </div>
              </div>
            </Card>
            <Card className="card-gradient border-none p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
                    Transfers
                  </p>
                  <p className="text-2xl font-black text-black mt-2">
                    {transferCount}
                  </p>
                  <p className="text-[10px] font-semibold text-black/40 mt-2">
                    Across active activity
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-black/60" />
                </div>
              </div>
            </Card>
          </div>

          {/* Financial Overview */}
          <div className="xl:col-span-7 flex flex-col gap-6 md:gap-8">
            <CategoryChart data={categorySpendingData} />
            <TransactionChart data={monthlySpendingData} />
          </div>

          {/* Activity Feed */}
          <div className="xl:col-span-5 flex flex-col gap-6 md:gap-8">
            <Card className="card-gradient border-none p-6">
              <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-black tracking-tight">
                  Activity Feed
                </CardTitle>
                <Activity className="w-4 h-4 text-black/40" />
              </CardHeader>
              <CardContent className="p-0">
                {recentActivity.length === 0 ? (
                  <div className="text-xs text-black/45 font-semibold">
                    No recent activity yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {recentActivity.map((item, index) => (
                      <div
                        key={`${item.type}-${index}`}
                        className="flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-black">
                            {item.title}
                          </p>
                          <p className="text-[10px] text-black/40">
                            {item.meta}
                          </p>
                        </div>
                        <span className="text-[10px] text-black/40">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="card-gradient border-none p-6">
              <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-black tracking-tight">
                  Support Snapshot
                </CardTitle>
                <UserCog className="w-4 h-4 text-black/40" />
              </CardHeader>
              <CardContent className="p-0 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-black">
                    Active members
                  </span>
                  <span className="font-black text-black">{activeUsers}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-black">
                    Accounts needing support
                  </span>
                  <span className="font-black text-black">
                    {pendingUsers.length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-black">Total notes</span>
                  <span className="font-black text-black">{totalNotes}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-black">
                    Archived activity
                  </span>
                  <span className="font-black text-black">
                    {archivedTransactions.length + archivedNotes}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Actions */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <Card className="card-gradient border-none p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base font-bold text-black tracking-tight">
                  Quiet Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-black">
                    Account checks
                  </span>
                  <span className="font-black text-black">
                    {pendingUsers.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-black">
                    Archive review
                  </span>
                  <span className="font-black text-black">
                    {archivedTransactions.length + archivedNotes}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-black">
                    Transfer monitoring
                  </span>
                  <span className="font-black text-black">{transferCount}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="card-gradient border-none p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base font-bold text-black tracking-tight">
                  Support Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 grid grid-cols-1 gap-2">
                <Button
                  onClick={() => handleSupportAction("Account support")}
                  className="button-gradient h-10 text-xs"
                >
                  Account support
                </Button>
                <Button
                  onClick={() => handleSupportAction("Category hygiene")}
                  className="button-gradient h-10 text-xs"
                >
                  Category hygiene
                </Button>
                <Button
                  onClick={() => handleSupportAction("Review archives")}
                  className="button-gradient h-10 text-xs"
                >
                  Review archives
                </Button>
                <Button
                  onClick={() => handleSupportAction("Emergency controls")}
                  className="button-gradient h-10 text-xs"
                >
                  Emergency controls
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transfers */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <Card className="card-gradient border-none p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-base font-bold text-black tracking-tight">
                  Recent Transfers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {activeTransactions.filter(
                  (t) => t.category.toLowerCase() === "transfer",
                ).length === 0 ? (
                  <div className="text-xs text-black/45 font-semibold">
                    No transfers recorded.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {activeTransactions
                      .filter((t) => t.category.toLowerCase() === "transfer")
                      .slice(0, 5)
                      .map((transfer) => (
                        <div
                          key={transfer.id}
                          className="flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-semibold text-black">
                              {transfer.title}
                            </p>
                            <p className="text-[10px] text-black/40">
                              {new Date(transfer.date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="font-black text-black">
                            {format(transfer.amount)}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Archive Overview */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <Card className="card-gradient border-none p-6">
              <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-black tracking-tight">
                  Archive Overview
                </CardTitle>
                <Archive className="w-4 h-4 text-black/40" />
              </CardHeader>
              <CardContent className="p-0 flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-black">
                    Archived transactions
                  </span>
                  <span className="font-black text-black">
                    {archivedTransactions.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-black">
                    Archived notes
                  </span>
                  <span className="font-black text-black">{archivedNotes}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* 2. THREE-COLUMN MEMBER DASHBOARD GRID */
        <div
          id="dashboard-content"
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start"
        >
          <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
            <CardWidget totalExpenses={totalActiveExpenses} />
            <RecentTransactions />
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
            <CategoryChart data={categorySpendingData} />
            <TransactionChart data={monthlySpendingData} />
          </div>

          <div className="lg:col-span-3 flex flex-col gap-6 md:gap-8">
            <QuickTransfer
              availableBalanceInINR={Math.max(
                0,
                allocationBaseInINR + totalIncome - totalExpense,
              )}
            />
            <PromoBanner />
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ========================================================
   SUB-COMPONENT 1: CARD WIDGET (VISA CARD + LIMIT PROGRESS)
   ======================================================== */
function CardWidget({ totalExpenses }: { totalExpenses: number }) {
  const { format } = useCurrency();
  const { addNotification } = useNotification();
  const { user, updatePersonalSettings } = useAuth();
  const [limitDraft, setLimitDraft] = useState(
    String(user?.preferences.spendingLimit ?? 300000),
  );
  const [savingLimit, setSavingLimit] = useState(false);

  const personalLimit = Math.max(
    1,
    Number(user?.preferences.spendingLimit ?? 300000),
  );
  const limitInActive = personalLimit;
  const spentInActive = totalExpenses;
  const remainingInActive = Math.max(0, personalLimit - totalExpenses);
  const percentUsed = Math.min(
    100,
    Math.round((totalExpenses / personalLimit) * 100),
  );

  const handleSaveLimit = async () => {
    const nextLimit = Number(limitDraft);
    if (!Number.isFinite(nextLimit) || nextLimit <= 0) {
      addNotification({
        message: "Enter a spending limit greater than 0.",
        type: "error",
      });
      return;
    }

    setSavingLimit(true);
    try {
      await updatePersonalSettings({ spendingLimit: nextLimit });
      addNotification({
        message: "Personal spending limit updated.",
        type: "success",
      });
    } finally {
      setSavingLimit(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Sleek Visa card */}
      <div className="w-full aspect-[1.58/1] rounded-[24px] bg-gradient-to-br from-[#1a1b1d] via-[#0d0e10] to-[#000000] p-6 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between border border-white/10 group select-none">
        {/* Animated Background glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#ccff00]/5 rounded-full blur-[80px] group-hover:bg-[#ccff00]/10 transition-all duration-500" />

        <div className="flex items-start justify-between z-10">
          <div>
            <p className="text-[10px] uppercase font-black tracking-widest text-white/40">
              Universal Card
            </p>
            <h3 className="text-sm font-bold tracking-tight mt-1 text-white/95">
              CTRL Fund Ltd.
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Contactless Wifi Icon */}
            <Wifi className="w-4 h-4 opacity-40 rotate-90" />
            <span className="text-base font-black italic tracking-tighter text-[#ccff00]/90">
              VISA
            </span>
          </div>
        </div>

        {/* Card Gold Chip Asset */}
        <div className="z-10 w-10 h-8 rounded-lg bg-gradient-to-br from-[#ffd700] via-[#e6c229] to-[#b39200] relative overflow-hidden border border-amber-400/40 shadow-inner flex flex-col justify-between p-1.5">
          <div className="w-full h-px bg-black/15" />
          <div className="w-full h-px bg-black/15" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-black/15" />
          <div className="w-4 h-4 rounded-full border border-black/10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400/20" />
        </div>

        <div className="z-10 flex flex-col gap-4">
          {/* Card Number */}
          <span className="font-mono text-base font-medium tracking-[0.2em] text-white/90">
            •••• •••• •••• 4789
          </span>
          {/* Holder Name & Expiry */}
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white/50">
            <div>
              <p className="text-[8px] text-white/30 font-black">Card Holder</p>
              <p className="mt-0.5 text-white/80">{user?.name || "User"}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-white/30 font-black">Expires</p>
              <p className="mt-0.5 text-white/80">12/28</p>
            </div>
          </div>
        </div>
      </div>

      {/* Credit limit widget */}
      <Card className="card-gradient border-none p-5">
        <div className="flex items-center justify-between mb-3.5">
          <span className="text-xs font-bold text-black tracking-tight">
            Credit Limit Usage
          </span>
          <span className="text-xs font-black text-black bg-[#ccff00] px-2 py-0.5 rounded-full border border-black/5 shadow-sm">
            {percentUsed}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-black/5 rounded-full overflow-hidden mb-4 border border-black/5 shadow-inner">
          <div
            className="h-full bg-black rounded-full transition-all duration-500 relative"
            style={{ width: `${percentUsed}%` }}
          >
            {/* Small lime tip highlight */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#ccff00] shadow-[0_0_8px_#ccff00]" />
          </div>
        </div>

        {/* Limit Numbers */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-[9px] font-bold text-black/40 uppercase">
              Spent
            </p>
            <p className="font-extrabold text-black mt-0.5">
              {format(spentInActive)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-black/40 uppercase">
              Limit
            </p>
            <p className="font-extrabold text-black mt-0.5">
              {format(limitInActive)}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3.5 border-t border-black/5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-black/40 uppercase">
            Available Credit
          </span>
          <span className="text-sm font-black text-black tracking-tight">
            {format(remainingInActive)}
          </span>
        </div>
      </Card>

      <div className="w-full border-2 border-dashed border-black/10 rounded-2xl p-3.5 flex flex-col gap-3 bg-white/30">
        <label className="text-[10px] font-black uppercase tracking-wider text-black/40">
          Personal Limit
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={limitDraft}
            onChange={(event) => setLimitDraft(event.target.value)}
            className="min-w-0 flex-1 h-10 rounded-xl bg-white border border-black/5 px-3 text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={handleSaveLimit}
            disabled={savingLimit}
            className="button-gradient h-10 px-4 text-xs disabled:opacity-60"
          >
            {savingLimit ? "Saving" : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================
   SUB-COMPONENT 2: QUICK TRANSFER (AVATARS + AMOUNT SEND)
   ======================================================== */
function QuickTransfer({
  availableBalanceInINR,
}: {
  availableBalanceInINR: number;
}) {
  const { symbol, convertToINR, currency } = useCurrency();
  const { addNotification } = useNotification();
  const { addTransaction } = useTransactions();
  const { permissions } = useRole();
  const [selectedFriend, setSelectedFriend] = useState(0);
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const friends = [
    {
      name: "Anna Davis",
      initials: "AD",
      color: "bg-rose-500/10 text-rose-600 border-rose-500/20",
    },
    {
      name: "Marcus Harris",
      initials: "MH",
      color: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    },
    {
      name: "Kelsey Long",
      initials: "KL",
      color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
    {
      name: "Tyler Lee",
      initials: "TL",
      color: "bg-[#ccff00]/15 text-black border-black/10",
    },
  ];

  const handleSend = async () => {
    if (!permissions.canAddTransactions) {
      addNotification({
        message: "You do not have permission to send transfers.",
        type: "info",
      });
      return;
    }

    if (availableBalanceInINR <= 0) {
      setError("Insufficient balance.");
      return;
    }

    const numAmount = Number.parseFloat(amount);
    if (!amount || Number.isNaN(numAmount) || numAmount <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }

    const amountInINR =
      currency === "INR" ? numAmount : convertToINR(numAmount);
    if (amountInINR > availableBalanceInINR) {
      setError("Insufficient balance.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      const friend = friends[selectedFriend];
      await addTransaction({
        title: `Transfer to ${friend.name}`,
        amount: amountInINR,
        type: "expense",
        category: "Transfer",
        date: new Date().toISOString(),
        description: "Quick transfer sent from dashboard",
      });
      setAmount("");
      setShowSuccess(true);
      addNotification({
        message: `Transfer sent to ${friend.name}.`,
        type: "success",
      });
      setTimeout(() => setShowSuccess(false), 1200);
    } catch (err: any) {
      setError(err?.message || "Failed to send transfer.");
      addNotification({
        message: "Transfer failed. Please try again.",
        type: "error",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="card-gradient border-none p-5">
      <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-black tracking-tight">
          Quick Transfer
        </CardTitle>
        <Sparkles className="w-4 h-4 text-black opacity-35" />
      </CardHeader>

      <CardContent className="p-0 flex flex-col gap-5">
        {/* Horizontal Friends List */}
        <div className="flex items-center justify-between gap-1.5 py-1">
          {friends.map((friend, i) => {
            const isSelected = selectedFriend === i;
            return (
              <button
                key={friend.name}
                onClick={() => setSelectedFriend(i)}
                className="flex flex-col items-center gap-1.5 focus:outline-none group"
                aria-pressed={isSelected}
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs border shadow-sm transition-all duration-300 ${friend.color} ${
                    isSelected
                      ? "ring-2 ring-black scale-105 shadow-md border-transparent"
                      : "group-hover:scale-105"
                  }`}
                >
                  {friend.initials}
                </div>
                <span
                  className={`text-[9px] font-bold tracking-tight transition-colors truncate max-w-[50px] ${
                    isSelected
                      ? "text-black"
                      : "text-black/45 group-hover:text-black"
                  }`}
                >
                  {friend.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Amount Input */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider">
            Transfer Amount
          </label>
          <div className="relative rounded-2xl border border-black/5 bg-black/[0.02] hover:bg-black/[0.04] transition focus-within:bg-white focus-within:ring-2 focus-within:ring-black focus-within:border-transparent overflow-hidden">
            {/* Currency Symbol Prefix */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-sm text-black/50 select-none">
              {symbol}
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (error) {
                  setError(null);
                }
              }}
              disabled={
                sending ||
                !permissions.canAddTransactions ||
                availableBalanceInINR <= 0
              }
              className="w-full bg-transparent pl-9 pr-4 py-3 text-sm font-extrabold text-black focus:outline-none placeholder:text-black/25"
            />
          </div>
          {error && (
            <p className="text-[10px] font-bold text-red-500">{error}</p>
          )}
          {availableBalanceInINR <= 0 && (
            <p className="text-[10px] font-semibold text-black/45">
              No amount left to transfer.
            </p>
          )}
          {!permissions.canAddTransactions && (
            <p className="text-[10px] font-semibold text-black/45">
              Transfers are view-only for your role.
            </p>
          )}
        </div>

        {/* Send Button */}
        {permissions.canAddTransactions && (
          <button
            onClick={handleSend}
            disabled={sending || availableBalanceInINR <= 0}
            className={`button-gradient w-full py-3 text-xs flex items-center justify-center gap-1.5 disabled:opacity-50 ${showSuccess ? "ring-2 ring-black/10" : ""}`}
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#ccff00]" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Send Money</span>
                <ArrowRight className="w-4 h-4 text-[#ccff00]" />
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}

/* ========================================================
   SUB-COMPONENT 3: PROMO BANNER (PIGGY BANK BANNER)
   ======================================================== */
function PromoBanner() {
  const { addNotification } = useNotification();

  const handleLearnMore = () => {
    addNotification({
      message:
        "Piggy Bank promotions are sponsored by CTRL Fund Ltd. Members enjoy high-yield savings interest rates!",
      type: "info",
    });
  };

  return (
    <div className="w-full bg-[#ccff00] rounded-[24px] p-5 border border-black/[0.05] relative overflow-hidden flex flex-col justify-between shadow-lg group select-none">
      {/* 25% Slanted Banner badge */}
      <div className="absolute top-4 right-4 bg-black text-[#ccff00] text-[10px] font-black px-2.5 py-1 rounded-lg rotate-[10deg] shadow-md border border-[#ccff00]/30 select-none">
        -25%
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[9px] uppercase font-black tracking-widest text-black/45">
          Promo Sponsored
        </span>
        <h4 className="text-base font-black text-black leading-tight tracking-tight max-w-[80%]">
          Save Smart. Grow Fundings.
        </h4>
        <p className="text-[10px] font-bold text-black/50 leading-relaxed max-w-[90%]">
          Earn a high-yield return on active business notes with dynamic
          deposits today.
        </p>
      </div>

      {/* Sourced hand-drawn piggy bank image */}
      <div className="my-3 py-1 flex justify-center">
        <img
          src="/piggy_bank.png"
          alt="Piggy Bank"
          className="w-full max-w-[130px] h-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 select-none pointer-events-none"
        />
      </div>

      {/* Action Button */}
      <button
        onClick={handleLearnMore}
        className="w-full bg-black text-white hover:bg-black/90 font-black text-[10px] uppercase tracking-wider py-3 rounded-full transition-all duration-200 shadow-md border border-black hover:border-black/80 hover:shadow-[0_0_12px_rgba(204,255,0,0.6)] focus:outline-none"
      >
        Learn More
      </button>
    </div>
  );
}
