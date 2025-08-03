import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Organization Expense Tracker",
  description: "A comprehensive expense tracking and inventory management system for organizations, councils, and institutions",
  keywords: ["expense tracker", "inventory management", "organization", "finance", "budget"],
  authors: [{ name: "David Porathur" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#00d4ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="antialiased bg-background text-foreground min-h-screen">
        <AuthProvider>
          <ThemeProvider>
            <div className="min-h-screen bg-gradient-to-br from-background via-surface-dark to-background">
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--surface)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontFamily: 'var(--font-body)',
                  },
                  success: {
                    iconTheme: {
                      primary: 'var(--success)',
                      secondary: 'var(--background)',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: 'var(--error)',
                      secondary: 'var(--background)',
                    },
                  },
                }}
              />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
