'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Filter, 
  Search, 
  Download,
  Eye,
  Edit3,
  Trash2,
  Check,
  X,
  Clock
} from 'lucide-react';
import { Transaction } from '@/types';

// Mock data - replace with real data from Firebase
const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: 'user1',
    organizationId: 'org1',
    type: 'expense',
    amount: 2500,
    category: 'Office Supplies',
    description: 'Stationery and office equipment',
    fundSource: 'college',
    department: 'General',
    approvalStatus: 'approved',
    approvedBy: 'admin1',
    date: new Date('2024-01-15'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    userId: 'user2',
    organizationId: 'org1',
    type: 'expense',
    amount: 8500,
    category: 'Equipment',
    description: 'Laptop for development team',
    fundSource: 'department',
    department: 'Technical',
    approvalStatus: 'pending',
    date: new Date('2024-01-14'),
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
  },
  {
    id: '3',
    userId: 'user3',
    organizationId: 'org1',
    type: 'expense',
    amount: 1200,
    category: 'Refreshments',
    description: 'Team meeting snacks and drinks',
    fundSource: 'personal',
    department: 'Cultural',
    approvalStatus: 'rejected',
    date: new Date('2024-01-13'),
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-13'),
  },
];

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success/20 text-success border-success/30';
      case 'pending':
        return 'bg-warning/20 text-warning border-warning/30';
      case 'rejected':
        return 'bg-error/20 text-error border-error/30';
      default:
        return 'bg-surface text-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Check className="h-3 w-3" />;
      case 'pending':
        return <Clock className="h-3 w-3" />;
      case 'rejected':
        return <X className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {getStatusIcon(status)}
      <span className="capitalize">{status}</span>
    </span>
  );
};

const FundSourceBadge = ({ source }: { source: string }) => {
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'college':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'department':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'personal':
        return 'bg-secondary/20 text-secondary border-secondary/30';
      case 'sponsorship':
        return 'bg-success/20 text-success border-success/30';
      default:
        return 'bg-surface text-foreground border-border';
    }
  };

  return (
    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border capitalize ${getSourceColor(source)}`}>
      {source}
    </span>
  );
};

export default function ExpensesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFund, setFilterFund] = useState('all');

  const filteredTransactions = mockTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || transaction.approvalStatus === filterStatus;
    const matchesFund = filterFund === 'all' || transaction.fundSource === filterFund;
    
    return matchesSearch && matchesStatus && matchesFund;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
            <p className="text-foreground/60 mt-1">
              Track and manage your organization's expenses
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border rounded-xl hover:bg-surface-dark transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:shadow-lg transition-all">
              <Plus className="h-4 w-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-effect rounded-2xl p-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filterFund}
                onChange={(e) => setFilterFund(e.target.value)}
                className="px-4 py-2 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="all">All Funds</option>
                <option value="college">College</option>
                <option value="department">Department</option>
                <option value="personal">Personal</option>
                <option value="sponsorship">Sponsorship</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-effect rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-dark">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Description</th>
                  <th className="text-left p-4 font-medium text-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-foreground">Fund Source</th>
                  <th className="text-left p-4 font-medium text-foreground">Department</th>
                  <th className="text-left p-4 font-medium text-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="border-t border-border hover:bg-surface-dark/50 transition-colors"
                  >
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{transaction.description}</p>
                        <p className="text-sm text-foreground/60">ID: {transaction.id}</p>
                      </div>
                    </td>
                    <td className="p-4 text-foreground/70">{transaction.category}</td>
                    <td className="p-4">
                      <span className="font-semibold text-error">
                        ${transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <FundSourceBadge source={transaction.fundSource} />
                    </td>
                    <td className="p-4 text-foreground/70">{transaction.department}</td>
                    <td className="p-4">
                      <StatusBadge status={transaction.approvalStatus} />
                    </td>
                    <td className="p-4 text-foreground/70">
                      {transaction.date.toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1.5 rounded-lg hover:bg-surface-dark transition-colors" title="View">
                          <Eye className="h-4 w-4 text-foreground/60" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-surface-dark transition-colors" title="Edit">
                          <Edit3 className="h-4 w-4 text-foreground/60" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-surface-dark transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4 text-error" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-foreground/60">No expenses found matching your criteria.</p>
            </div>
          )}
        </motion.div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-effect rounded-2xl p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Total Expenses</h3>
            <p className="text-3xl font-bold text-error">
              ${filteredTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-effect rounded-2xl p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Pending Approval</h3>
            <p className="text-3xl font-bold text-warning">
              {filteredTransactions.filter(t => t.approvalStatus === 'pending').length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-effect rounded-2xl p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">This Month</h3>
            <p className="text-3xl font-bold text-primary">
              ${filteredTransactions
                .filter(t => t.date.getMonth() === new Date().getMonth())
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </p>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}