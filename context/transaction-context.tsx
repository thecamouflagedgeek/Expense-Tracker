"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useNotification } from "@/contexts/notification-context"
import { addDoc, collection, deleteDoc, doc, getDoc, onSnapshot, query, updateDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export type Transaction = {
  id: string
  title: string
  amount: number
  type: "income" | "expense"
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
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const normalizeDate = (value: any) => {
    if (!value) return new Date().toISOString()
    if (typeof value === "string") return value
    if (value?.toDate) return value.toDate().toISOString()
    return new Date().toISOString()
  }

  const normalizeAmountByType = (amount: number, type: Transaction["type"] = "expense") => {
    const rawAmount = Math.abs(amount || 0)
    return type === "income" ? rawAmount : -rawAmount
  }

  useEffect(() => {
    if (!user) {
      setTransactions([])
      setCategories([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const transactionsQuery = query(collection(db, "transactions"), where("userId", "==", user.id))
    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const nextTransactions = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data()
            const transactionType: Transaction["type"] = data.type === "income" ? "income" : "expense"
            return {
              id: docSnap.id,
              title: data.title ?? "",
              amount: normalizeAmountByType(data.amount ?? 0, transactionType),
              type: transactionType,
              category: data.category ?? "",
              date: normalizeDate(data.date),
              description: data.description ?? "",
              userId: data.userId ?? user.id,
              isArchived: Boolean(data.isArchived),
            }
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setTransactions(nextTransactions)
        setCategories(Array.from(new Set(nextTransactions.map((t) => t.category))).filter(Boolean))
        setLoading(false)
      },
      (err) => {
        console.error("Error loading transactions:", err)
        setError("Failed to load transactions")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])



  const addTransaction = async (transaction: Omit<Transaction, "id" | "userId">) => {
    if (!user) {
      const error = "User not authenticated"
      setError(error)
      addNotification({ message: error, type: "error" })
      throw new Error(error)
    }

    try {
      await addDoc(collection(db, "transactions"), {
        ...transaction,
        amount: normalizeAmountByType(transaction.amount, transaction.type),
        userId: user.id,
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      
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
      let nextFields = { ...updatedFields }

      if (typeof nextFields.amount === "number") {
        let transactionType = nextFields.type

        if (!transactionType) {
          const existingDoc = await getDoc(doc(db, "transactions", id))
          const existingData = existingDoc.data()
          transactionType = existingData?.type === "income" ? "income" : "expense"
        }

        nextFields.amount = normalizeAmountByType(nextFields.amount, transactionType)
      }

      await updateDoc(doc(db, "transactions", id), {
        ...nextFields,
        updatedAt: new Date().toISOString(),
      })
      
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
      await deleteDoc(doc(db, "transactions", id))
      
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
