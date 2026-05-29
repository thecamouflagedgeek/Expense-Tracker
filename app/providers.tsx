"use client";

import type React from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { RoleProvider } from "@/contexts/role-context";
import { TransactionProvider } from "@/context/transaction-context";
import { NotificationProvider } from "@/contexts/notification-context";
import { CurrencyProvider } from "@/context/currency-context";
import { Navigation } from "@/components/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { Toaster } from "@/components/ui/toaster";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <RoleProvider>
          <CurrencyProvider>
            <TransactionProvider>
              <div className="min-h-screen grid-bg-pattern font-sans antialiased text-[#0c0d0e]">
                <Navigation />
                <main className="md:pl-28 pt-24 pr-4 md:pr-8 pb-24 md:pb-8 transition-all duration-300">
                  {children}
                </main>
              </div>
              <Toaster />
            </TransactionProvider>
          </CurrencyProvider>
        </RoleProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}
