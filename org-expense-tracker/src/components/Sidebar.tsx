'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  Package,
  BarChart3,
  Users,
  Settings,
  Building2,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  HandHeart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    roles: ['main_admin', 'college_admin', 'department_user', 'viewer'],
  },
  {
    title: 'Expenses',
    icon: Receipt,
    href: '/expenses',
    roles: ['main_admin', 'college_admin', 'department_user'],
  },
  {
    title: 'Inventory',
    icon: Package,
    href: '/inventory',
    roles: ['main_admin', 'college_admin', 'department_user'],
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    roles: ['main_admin', 'college_admin', 'department_user', 'viewer'],
  },
  {
    title: 'Sponsorships',
    icon: HandHeart,
    href: '/sponsorships',
    roles: ['main_admin', 'college_admin'],
  },
  {
    title: 'Reports',
    icon: FileText,
    href: '/reports',
    roles: ['main_admin', 'college_admin', 'viewer'],
  },
  {
    title: 'Export Data',
    icon: Download,
    href: '/export',
    roles: ['main_admin', 'college_admin'],
  },
  {
    title: 'Users',
    icon: Users,
    href: '/users',
    roles: ['main_admin'],
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
    roles: ['main_admin', 'college_admin'],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex fixed left-0 top-0 h-full bg-surface border-r border-border flex-col z-50"
      >
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-foreground">OrgTracker</h1>
                  <p className="text-xs text-foreground/60">Expense & Inventory</p>
                </div>
              </motion.div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-surface-dark transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: collapsed ? 4 : 2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all relative ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30'
                      : 'text-foreground/70 hover:text-foreground hover:bg-surface-dark'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                  {!collapsed && (
                    <span className="font-medium">{item.title}</span>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-l-full"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        {!collapsed && user && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-surface-dark">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-foreground/60 capitalize">
                  {user.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Mobile Sidebar - TODO: Implement mobile sidebar */}
    </>
  );
}