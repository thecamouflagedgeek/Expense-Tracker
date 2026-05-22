"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useNotification } from "@/contexts/notification-context"
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

type Note = {
  id?: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  userId?: string
  isArchived?: boolean
}

export const useNotes = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const normalizeDate = (value: any) => {
    if (!value) return new Date().toISOString()
    if (typeof value === "string") return value
    if (value?.toDate) return value.toDate().toISOString()
    return new Date().toISOString()
  }

  useEffect(() => {
    if (!user) {
      setNotes([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const notesQuery = query(collection(db, "notes"), where("userId", "==", user.id))
    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        const nextNotes = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data()
            return {
              id: docSnap.id,
              title: data.title ?? "",
              content: data.content ?? "",
              createdAt: normalizeDate(data.createdAt),
              updatedAt: normalizeDate(data.updatedAt),
              userId: data.userId ?? user.id,
              isArchived: Boolean(data.isArchived),
            }
          })
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

        setNotes(nextNotes)
        setLoading(false)
      },
      (err) => {
        console.error("Error loading notes:", err)
        setError("Failed to load notes")
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  const createNote = useCallback(
    async (note: Omit<Note, "id" | "userId">) => {
      if (!user) {
        setError("User not authenticated.")
        addNotification({
          id: Date.now(),
          message: "Failed to create note: User not authenticated.",
          type: "error",
        })
        return
      }

      try {
        const now = new Date().toISOString()
        await addDoc(collection(db, "notes"), {
          ...note,
          userId: user.id,
          isArchived: false,
          createdAt: note.createdAt || now,
          updatedAt: note.updatedAt || now,
        })
        addNotification({
          id: Date.now(),
          message: `Note "${note.title}" created successfully!`,
          type: "success",
        })
      } catch (err: any) {
        console.error("Error creating note:", err)
        setError(err.message || "Failed to create note.")
        addNotification({
          id: Date.now(),
          message: `Failed to create note: ${err.message}`,
          type: "error",
        })
        throw err
      }
    },
    [user, addNotification],
  )

  const updateNote = useCallback(
    async (id: string, updatedFields: Partial<Omit<Note, "id" | "userId">>) => {
      if (!user) {
        setError("User not authenticated.")
        addNotification({
          id: Date.now(),
          message: "Failed to update note: User not authenticated.",
          type: "error",
        })
        return
      }

      try {
        await updateDoc(doc(db, "notes", id), {
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        })
        addNotification({
          id: Date.now(),
          message: `Note "${updatedFields.title || id}" updated successfully!`,
          type: "success",
        })
      } catch (err: any) {
        console.error("Error updating note:", err)
        setError(err.message || "Failed to update note.")
        addNotification({
          id: Date.now(),
          message: `Failed to update note: ${err.message}`,
          type: "error",
        })
        throw err
      }
    },
    [user, addNotification],
  )

  const deleteNote = useCallback(
    async (id: string) => {
      if (!user) {
        setError("User not authenticated.")
        addNotification({
          id: Date.now(),
          message: "Failed to delete note: User not authenticated.",
          type: "error",
        })
        return
      }

      try {
        await deleteDoc(doc(db, "notes", id))
        addNotification({
          id: Date.now(),
          message: `Note deleted successfully!`,
          type: "success",
        })
      } catch (err: any) {
        console.error("Error deleting note:", err)
        setError(err.message || "Failed to delete note.")
        addNotification({
          id: Date.now(),
          message: `Failed to delete note: ${err.message}`,
          type: "error",
        })
        throw err
      }
    },
    [user, addNotification],
  )

  const setNoteArchived = useCallback(
    async (id: string, isArchived: boolean) => {
      if (!user) {
        setError("User not authenticated.")
        addNotification({
          message: "Failed to update note: User not authenticated.",
          type: "error",
        })
        return
      }

      try {
        await updateDoc(doc(db, "notes", id), {
          isArchived,
          updatedAt: new Date().toISOString(),
        })
        addNotification({
          message: isArchived ? "Note archived." : "Note restored.",
          type: "success",
        })
      } catch (err: any) {
        console.error("Error updating note:", err)
        setError(err.message || "Failed to update note.")
        addNotification({
          message: `Failed to update note: ${err.message}`,
          type: "error",
        })
        throw err
      }
    },
    [user, addNotification],
  )

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    setNoteArchived,
  }
}
