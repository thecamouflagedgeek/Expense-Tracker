"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useNotification } from "@/contexts/notification-context"

const TRANSACTIONS_KEY = 'ctrlfund_transactions'

export type Transaction = {
  id: string
  title: string
  amount: number
  category: string
  date: string
  description?: string
  userId: string
  isArchived?: boolean
}

type TransactionContextType = {
  transactions: Transaction[]
  categories: string[]
  loading: boolean
  error: string | null
  addTransaction: (transaction: Omit<Transaction, "id" | "userId">) => Promise<void>
  updateTransaction: (id: string, updatedFields: Partial<Omit<Transaction, "id" | "userId">>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

export const TransactionContext = createContext<TransactionContextType | undefined>(undefined)



export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setAllTransactions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    // Load transactions from localStorage
    try {
      const stored = localStorage.getItem(TRANSACTIONS_KEY)
      let allTransactionsData: Transaction[] = stored ? JSON.parse(stored) : []
      
      // Migrate old over-scaled seeds back to real INR amounts
      let migrated = false
      allTransactionsData = allTransactionsData.map(t => {
        if (t.userId === user.id && t.id.startsWith("trans-mock-")) {
          if (t.id === "trans-mock-1" && t.amount !== 10.67)  { t.amount = 10.67;  migrated = true; }
          if (t.id === "trans-mock-2" && t.amount !== 12.01)  { t.amount = 12.01;  migrated = true; }
          if (t.id === "trans-mock-3" && t.amount !== 112.43) { t.amount = 112.43; migrated = true; }
          if (t.id === "trans-mock-4" && t.amount !== 16.00)  { t.amount = 16.00;  migrated = true; }
          if (t.id === "trans-mock-5" && t.amount !== 112.43) { t.amount = 112.43; migrated = true; }
        }
        return t
      })
      if (migrated) {
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactionsData))
      }

      // Filter by user
      let userTransactions = allTransactionsData.filter(t => t.userId === user.id)
      
      // If user has no transactions, seed the mockup ones in INR!
      if (userTransactions.length === 0) {
        const seedTransactions: Transaction[] = [
          {
            id: `trans-mock-1`,
            title: "Paypal",
            amount: 10.67, // base INR – converts live to any selected currency
            category: "Other",
            date: "2026-07-08T11:55:00.000Z",
            description: "PayPal Online Transfer",
            userId: user.id,
            isArchived: false,
          },
          {
            id: `trans-mock-2`,
            title: "Twitch",
            amount: 12.01, // base INR
            category: "Bills",
            date: "2026-07-07T19:50:00.000Z",
            description: "Twitch Premium Subscription",
            userId: user.id,
            isArchived: false,
          },
          {
            id: `trans-mock-3`,
            title: "Airbnb",
            amount: 112.43, // base INR
            category: "Home goods",
            date: "2026-07-06T11:17:00.000Z",
            description: "Airbnb lodging stays",
            userId: user.id,
            isArchived: false,
          },
          {
            id: `trans-mock-4`,
            title: "Dribbble",
            amount: 16.00, // base INR
            category: "Sporting goods",
            date: "2026-07-06T09:35:00.000Z",
            description: "Dribbble Pro Account subscription",
            userId: user.id,
            isArchived: false,
          },
          {
            id: `trans-mock-5`,
            title: "Airbnb",
            amount: 112.43, // base INR
            category: "Home goods",
            date: "2026-07-06T11:17:00.000Z",
            description: "Airbnb lodging stays #2",
            userId: user.id,
            isArchived: false,
          }
        ]
        
        // Append seed transactions to the stored list
        allTransactionsData = [...allTransactionsData, ...seedTransactions]
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactionsData))
        userTransactions = seedTransactions
      }

      // Sort by date
      const sortedTransactions = userTransactions.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      
      setAllTransactions(sortedTransactions)
      setLoading(false)
    } catch (error) {
      console.error("Error loading transactions:", error)
      setError("Failed to load transactions")
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setTransactions([])
      setCategories([])
      return
    }

    const userTransactions = allTransactions.filter((t) => t.userId === user.id)
    setTransactions(userTransactions)

    const uniqueCategories = Array.from(new Set(userTransactions.map((t) => t.category)))
    setCategories(uniqueCategories)
  }, [user, allTransactions])



  const addTransaction = async (transaction: Omit<Transaction, "id" | "userId">) => {
    if (!user) {
      const error = "User not authenticated"
      setError(error)
      addNotification({ message: error, type: "error" })
      throw new Error(error)
    }

    try {
      const newTransaction: Transaction = {
        ...transaction,
        id: `trans-${Date.now()}`,
        userId: user.id,
        isArchived: false,
      }

      // Load all transactions
      const stored = localStorage.getItem(TRANSACTIONS_KEY)
      const allTransactions: Transaction[] = stored ? JSON.parse(stored) : []
      
      // Add new transaction
      allTransactions.push(newTransaction)
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(allTransactions))
      
      // Update local state
      setAllTransactions((prev) => [...prev, newTransaction])
      
      addNotification({
        message: `Transaction "${transaction.title}" added successfully!`,
        type: "success",
      })
    } catch (err: any) {
      const errorMessage = err.message || "Failed to add transaction"
      setError(errorMessage)
      addNotification({ message: errorMessage, type: "error" })
      throw err
    }
  }

  const updateTransaction = async (id: string, updatedFields: Partial<Omit<Transaction, "id" | "userId">>) => {
    if (!user) {
      const error = "User not authenticated"
      setError(error)
      addNotification({ message: error, type: "error" })
      throw new Error(error)
    }

    try {
      // Load all transactions
      const stored = localStorage.getItem(TRANSACTIONS_KEY)
      const allTransactions: Transaction[] = stored ? JSON.parse(stored) : []
      
      // Update transaction
      const updatedTransactions = allTransactions.map((t) =>
        t.id === id ? { ...t, ...updatedFields } : t
      )
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions))
      
      // Update local state
      setAllTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)))
      
      addNotification({
        message: "Transaction updated successfully!",
        type: "success",
      })
    } catch (err: any) {
      const errorMessage = err.message || "Failed to update transaction"
      setError(errorMessage)
      addNotification({ message: errorMessage, type: "error" })
      throw err
    }
  }

  const deleteTransaction = async (id: string) => {
    if (!user) {
      const error = "User not authenticated"
      setError(error)
      addNotification({ message: error, type: "error" })
      throw new Error(error)
    }

    try {
      // Load all transactions
      const stored = localStorage.getItem(TRANSACTIONS_KEY)
      const allTransactions: Transaction[] = stored ? JSON.parse(stored) : []
      
      // Remove transaction
      const updatedTransactions = allTransactions.filter((t) => t.id !== id)
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions))
      
      // Update local state
      setAllTransactions((prev) => prev.filter((t) => t.id !== id))
      
      addNotification({
        message: "Transaction deleted successfully!",
        type: "success",
      })
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete transaction"
      setError(errorMessage)
      addNotification({ message: errorMessage, type: "error" })
      throw err
    }
  }

  const contextValue = {
    transactions,
    categories,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  }

  return <TransactionContext.Provider value={contextValue}>{children}</TransactionContext.Provider>
}

export const useTransactions = () => {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider")
  }
  return context
}
