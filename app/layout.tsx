import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { RoleProvider } from "@/contexts/role-context"
import { TransactionProvider } from "@/context/transaction-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { Toaster } from "@/components/ui/toaster" // Import Toaster for shadcn/ui toasts

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CtrlFund - Expense & Notes Tracker",
  description: "Manage your team's expenses and notes efficiently.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationProvider>
          <AuthProvider>
            <RoleProvider>
              <TransactionProvider>
                <Navigation />
                <ProtectedRoute>{children}</ProtectedRoute>
                <Toaster /> {/* Render Toaster component */}
              </TransactionProvider>
            </RoleProvider>
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}
