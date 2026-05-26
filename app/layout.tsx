import type { Metadata } from "next"
import "./globals.css"
import { ClientProviders } from "./providers"

export const metadata: Metadata = {
  title: "CtrlFund - Expense & Notes Tracker",
  description: "Manage your team's expenses and notes efficiently.",
  generator: 'v0.dev',
  icons: { icon: '/expense_tracker_logo.png' }
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  )
}
