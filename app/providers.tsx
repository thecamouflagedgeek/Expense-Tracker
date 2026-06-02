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
import { ThemeProvider } from "@/components/theme-provider";
import { usePathname } from "next/navigation";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme={isLandingPage ? undefined : "light"}>
      <NotificationProvider>
        <AuthProvider>
          <RoleProvider>
            <CurrencyProvider>
              <TransactionProvider>
                {isLandingPage ? (
                  <div className="min-h-screen grid-bg-pattern font-sans antialiased text-[#0c0d0e] dark:text-white">
                    <ProtectedRoute>{children}</ProtectedRoute>
                  </div>
                ) : (
                  <div className="min-h-screen grid-bg-pattern font-sans antialiased text-[#0c0d0e] dark:text-white">
                    <Navigation />
                    <main className="px-4 md:pl-28 md:pr-8 pt-24 pb-24 md:pb-8 transition-all duration-300">
                      <ProtectedRoute>{children}</ProtectedRoute>
                    </main>
                  </div>
                )}
                <Toaster />
              </TransactionProvider>
            </CurrencyProvider>
          </RoleProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
