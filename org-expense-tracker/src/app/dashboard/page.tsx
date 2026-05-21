'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// Mock data - replace with real data from Firebase
const mockStats = {
  totalBudget: 50000,
  totalSpent: 32500,
  totalInventory: 1250,
  pendingApprovals: 8,
};

const mockRecentTransactions = [
  {
    id: '1',
    description: 'Office Supplies Purchase',
    amount: 2500,
    type: 'expense' as const,
    category: 'Office Supplies',
    fundSource: 'college',
    date: '2024-01-15',
  },
  {
    id: '2',
    description: 'Event Sponsorship',
    amount: 15000,
    type: 'income' as const,
    category: 'Sponsorships',
    fundSource: 'sponsorship',
    date: '2024-01-14',
  },
  {
    id: '3',
    description: 'Equipment Purchase',
    amount: 8500,
    type: 'expense' as const,
    category: 'Equipment',
    fundSource: 'department',
    date: '2024-01-13',
  },
];

const StatCard = ({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  color 
}: {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: any;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="glass-effect rounded-2xl p-6 hover:scale-105 transition-transform duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className={`flex items-center space-x-1 text-sm ${
        changeType === 'positive' ? 'text-success' : 'text-error'
      }`}>
        {changeType === 'positive' ? (
          <ArrowUpRight className="h-4 w-4" />
        ) : (
          <ArrowDownRight className="h-4 w-4" />
        )}
        <span>{change}</span>
      </div>
    </div>
    <h3 className="text-2xl font-bold text-foreground mb-1">{value}</h3>
    <p className="text-foreground/60 text-sm">{title}</p>
  </motion.div>
);

export default function DashboardPage() {
  const budgetUtilization = (mockStats.totalSpent / mockStats.totalBudget) * 100;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-foreground/60 mt-1">
              Welcome back! Here's what's happening with your organization.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-foreground/60">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Budget"
            value={`$${mockStats.totalBudget.toLocaleString()}`}
            change="+12.5%"
            changeType="positive"
            icon={DollarSign}
            color="bg-gradient-to-r from-primary to-accent"
          />
          <StatCard
            title="Total Spent"
            value={`$${mockStats.totalSpent.toLocaleString()}`}
            change="+8.2%"
            changeType="positive"
            icon={TrendingUp}
            color="bg-gradient-to-r from-secondary to-warning"
          />
          <StatCard
            title="Inventory Items"
            value={mockStats.totalInventory.toLocaleString()}
            change="+5.1%"
            changeType="positive"
            icon={Package}
            color="bg-gradient-to-r from-success to-accent"
          />
          <StatCard
            title="Pending Approvals"
            value={mockStats.pendingApprovals.toString()}
            change="-15.3%"
            changeType="negative"
            icon={Users}
            color="bg-gradient-to-r from-error to-secondary"
          />
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-effect rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Budget Utilization</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-foreground/70">Current Usage</span>
                <span className="font-semibold text-foreground">{budgetUtilization.toFixed(1)}%</span>
              </div>
              
              <div className="w-full bg-surface-dark rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetUtilization}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-primary to-accent h-3 rounded-full"
                />
              </div>
              
              <div className="flex justify-between text-sm text-foreground/60">
                <span>Spent: ${mockStats.totalSpent.toLocaleString()}</span>
                <span>Budget: ${mockStats.totalBudget.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-effect rounded-2xl p-6"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Recent Transactions</h2>
            
            <div className="space-y-4">
              {mockRecentTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-center justify-between p-3 bg-surface-dark rounded-xl hover:bg-surface transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' 
                        ? 'bg-success/20 text-success' 
                        : 'bg-error/20 text-error'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-foreground/60 capitalize">
                        {transaction.category} • {transaction.fundSource}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-success' : 'text-error'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-foreground/60">{transaction.date}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <button className="w-full mt-4 py-2 text-primary hover:text-accent transition-colors text-sm font-medium">
              View All Transactions
            </button>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-6">Quick Actions</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Add Expense', color: 'from-error to-secondary' },
              { title: 'Add Inventory', color: 'from-success to-accent' },
              { title: 'Generate Report', color: 'from-primary to-accent' },
              { title: 'Export Data', color: 'from-warning to-secondary' },
            ].map((action, index) => (
              <button
                key={index}
                className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white font-medium hover:scale-105 transition-transform duration-200`}
              >
                {action.title}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}