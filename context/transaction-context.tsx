"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useNotification } from "@/contexts/notification-context"
import { db } from "@/lib/firebaseConfig"
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, orderBy } from "firebase/firestore"

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

    // Set up real-time listener for transactions
    const transactionsQuery = query(
      collection(db, "transactions"),
      where("userId", "==", user.id),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const transactionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Transaction[]
        
        setAllTransactions(transactionsData)
        setLoading(false)
      },
      (error) => {
        console.error("Error loading transactions:", error)
        setError("Failed to load transactions")
        setLoading(false)
      }
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
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
      const newTransaction = {
        ...transaction,
        userId: user.id,
        isArchived: false,
        createdAt: new Date().toISOString(),
      }

      // Add to Firestore
      const docRef = await addDoc(collection(db, "transactions"), newTransaction)
      
      // Update local state with the new transaction (including the Firestore ID)
      const transactionWithId = { ...newTransaction, id: docRef.id }
      setAllTransactions((prev) => [...prev, transactionWithId])
      
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
      // Update in Firestore
      await updateDoc(doc(db, "transactions", id), updatedFields)
      
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
      // Delete from Firestore
      await deleteDoc(doc(db, "transactions", id))
      
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
