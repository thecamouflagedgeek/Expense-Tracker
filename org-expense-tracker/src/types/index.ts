export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  organizationId: string;
  role: 'main_admin' | 'college_admin' | 'department_user' | 'viewer';
  department?: string;
  permissions: string[];
  createdAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  type: 'college' | 'council' | 'company' | 'ngo';
  settings: {
    currency: string;
    fiscalYearStart: Date;
    budgetApprovalRequired: boolean;
  };
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  organizationId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  subcategory?: string;
  description: string;
  fundSource: 'personal' | 'college' | 'department' | 'sponsorship';
  department?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  receiptUrl?: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  totalValue: number;
  location: {
    building?: string;
    room?: string;
    shelf?: string;
    notes?: string;
  };
  condition: 'new' | 'good' | 'fair' | 'poor' | 'damaged';
  purchaseDate: Date;
  purchaseTransactionId?: string;
  assignedTo?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'disposed';
  imageUrls: string[];
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sponsorship {
  id: string;
  organizationId: string;
  sponsorName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  amount: number;
  type: 'cash' | 'in_kind' | 'both';
  description: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'cancelled';
  documentsFolder?: string; // Google Drive folder ID
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  id: string;
  organizationId: string;
  department?: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: {
    start: Date;
    end: Date;
  };
  status: 'active' | 'exceeded' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  subcategories?: string[];
}

export interface ExportRequest {
  id: string;
  userId: string;
  organizationId: string;
  type: 'transactions' | 'inventory' | 'budget' | 'sponsorships' | 'all';
  filters: {
    dateRange?: { start: Date; end: Date };
    departments?: string[];
    categories?: string[];
    fundSources?: string[];
  };
  format: 'xlsx' | 'csv' | 'pdf';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
}

// Categories for organizational use
export const EXPENSE_CATEGORIES: Category[] = [
  { id: '1', name: 'Office Supplies', icon: '📎', color: '#FF6B6B', type: 'expense' },
  { id: '2', name: 'Equipment', icon: '💻', color: '#4ECDC4', type: 'expense' },
  { id: '3', name: 'Travel & Transport', icon: '🚗', color: '#45B7D1', type: 'expense' },
  { id: '4', name: 'Events & Programs', icon: '🎪', color: '#96CEB4', type: 'expense' },
  { id: '5', name: 'Utilities & Bills', icon: '⚡', color: '#FFEAA7', type: 'expense' },
  { id: '6', name: 'Marketing & PR', icon: '📢', color: '#DDA0DD', type: 'expense' },
  { id: '7', name: 'Training & Development', icon: '📚', color: '#F39C12', type: 'expense' },
  { id: '8', name: 'Maintenance', icon: '🔧', color: '#E74C3C', type: 'expense' },
  { id: '9', name: 'Refreshments', icon: '☕', color: '#A569BD', type: 'expense' },
  { id: '10', name: 'Miscellaneous', icon: '💰', color: '#BDC3C7', type: 'expense' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: '11', name: 'College Funds', icon: '🏫', color: '#2ECC71', type: 'income' },
  { id: '12', name: 'Sponsorships', icon: '🤝', color: '#3498DB', type: 'income' },
  { id: '13', name: 'Grants', icon: '💰', color: '#9B59B6', type: 'income' },
  { id: '14', name: 'Event Revenue', icon: '🎟️', color: '#E67E22', type: 'income' },
  { id: '15', name: 'Donations', icon: '💝', color: '#E91E63', type: 'income' },
  { id: '16', name: 'Membership Fees', icon: '👥', color: '#27AE60', type: 'income' },
  { id: '17', name: 'Other Income', icon: '💵', color: '#34495E', type: 'income' },
];

export const INVENTORY_CATEGORIES = [
  'Electronics',
  'Furniture',
  'Stationery',
  'Equipment',
  'Books',
  'Decorations',
  'Sports Equipment',
  'Kitchen Items',
  'Cleaning Supplies',
  'Other'
];

export const DEPARTMENTS = [
  'General',
  'Technical',
  'Cultural',
  'Sports',
  'Academic',
  'Administration',
  'Finance',
  'Marketing',
  'Other'
];