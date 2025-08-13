"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useNotification } from "@/contexts/notification-context"

type Transaction = {
  id?: string
  title: string
  amount: number
  category: string
  date: string
  description?: string
  userId?: string
}

const LOCAL_STORAGE_TRANSACTIONS_KEY = "ctrlfund_transactions"

const MOCK_TRANSACTIONS = [
  {
    id: "1",
    title: "Office Supplies",
    amount: 150.0,
    category: "Office",
    date: "2024-01-15",
    description: "Pens, paper, and folders",
    userId: "1",
  },
  {
    id: "2",
    title: "Team Lunch",
    amount: 85.5,
    category: "Food",
    date: "2024-01-14",
    description: "Team building lunch",
    userId: "1",
  },
  {
    id: "3",
    title: "Software License",
    amount: 299.99,
    category: "Software",
    date: "2024-01-13",
    description: "Annual subscription renewal",
    userId: "2",
  },
]

export const useTransactions = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [allTransactions, setAllTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedTransactions = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY)
        if (storedTransactions) {
          const parsed = JSON.parse(storedTransactions)
          setAllTransactions(parsed)
        } else {
          localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(MOCK_TRANSACTIONS))
        }
      } catch (err: any) {
        console.error("Error loading transactions:", err)
        setError("Failed to load transactions from storage")
      }
      setLoading(false)
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    if (!user) {
      setTransactions([])
      setCategories([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 200))

      const userTransactions = allTransactions.filter((t) => t.userId === user.id)
      setTransactions(userTransactions)

      const uniqueCategories = Array.from(new Set(userTransactions.map((t) => t.category)))
      setCategories(uniqueCategories)
    } catch (err: any) {
      console.error("Error fetching transactions:", err)
      setError(err.message || "Failed to fetch transactions.")
      addNotification({
        id: Date.now(),
        message: `Failed to fetch transactions: ${err.message}`,
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [user, allTransactions, addNotification])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => {
    if (typeof window !== "undefined" && !loading) {
      localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(allTransactions))
    }
  }, [allTransactions, loading])

  const addTransaction = useCallback(
    async (transaction: Omit<Transaction, "id" | "userId">) => {
      if (!user) {
        setError("User not authenticated.")
        addNotification({
          id: Date.now(),
          message: "Failed to add transaction: User not authenticated.",
          type: "error",
        })
        return
      }

      try {
        await new Promise((resolve) => setTimeout(resolve, 200))

        const newTransaction = {
          ...transaction,
          id: crypto.randomUUID(),
          userId: user.id,
        }

        setAllTransactions((prev) => [...prev, newTransaction])
        addNotification({
          id: Date.now(),
          message: `Transaction "${transaction.title}" added successfully!`,
          type: "success",
        })
      } catch (err: any) {
        console.error("Error adding transaction:", err)
        setError(err.message || "Failed to add transaction.")
        addNotification({
          id: Date.now(),
          message: `Failed to add transaction: ${err.message}`,
          type: "error",
        })
        throw err
      }
    },
    [user, addNotification],
  )

  const updateTransaction = useCallback(
    async (id: string, updatedFields: Partial<Omit<Transaction, "id" | "userId">>) => {
      if (!user) {
        setError("User not authenticated.")
        addNotification({
          id: Date.now(),
          message: "Failed to update transaction: User not authenticated.",
          type: "error",
        })
        return
      }

      try {
        await new Promise((resolve) => setTimeout(resolve, 200))

        setAllTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t)))
        addNotification({
          id: Date.now(),
          message: `Transaction "${updatedFields.title || id}" updated successfully!`,
          type: "success",
        })
      } catch (err: any) {
        console.error("Error updating transaction:", err)
        setError(err.message || "Failed to update transaction.")
        addNotification({
          id: Date.now(),
          message: `Failed to update transaction: ${err.message}`,
          type: "error",
        })
        throw err
      }
    },
    [user, addNotification],
  )

  const deleteTransaction = useCallback(
    async (id: string) => {
      if (!user) {
        setError("User not authenticated.")
        addNotification({
          id: Date.now(),
          message: "Failed to delete transaction: User not authenticated.",
          type: "error",
        })
        return
      }

      try {
        await new Promise((resolve) => setTimeout(resolve, 200))

        setAllTransactions((prev) => prev.filter((t) => t.id !== id))
        addNotification({
          id: Date.now(),
          message: `Transaction deleted successfully!`,
          type: "success",
        })
      } catch (err: any) {
        console.error("Error deleting transaction:", err)
        setError(err.message || "Failed to delete transaction.")
        addNotification({
          id: Date.now(),
          message: `Failed to delete transaction: ${err.message}`,
          type: "error",
        })
        throw err
      }
    },
    [user, addNotification],
  )

  return {
    transactions,
    categories,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
  }
}
