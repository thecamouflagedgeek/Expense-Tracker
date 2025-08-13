"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useNotification } from "@/contexts/notification-context"

type Note = {
  id?: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  userId?: string
  isArchived?: boolean
}

const LOCAL_STORAGE_NOTES_KEY = "ctrlfund_notes"

const MOCK_NOTES = [
  {
    id: "1",
    title: "Project Meeting Notes",
    content: "Discussed project timeline and deliverables. Next meeting scheduled for next week.",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    userId: "1",
    isArchived: false,
  },
  {
    id: "2",
    title: "Budget Planning",
    content: "Need to review Q1 budget allocations and plan for Q2 expenses.",
    createdAt: "2024-01-14T14:30:00Z",
    updatedAt: "2024-01-14T14:30:00Z",
    userId: "1",
    isArchived: false,
  },
  {
    id: "3",
    title: "Team Feedback",
    content: "Collected feedback from team members on current processes and improvements.",
    createdAt: "2024-01-13T09:15:00Z",
    updatedAt: "2024-01-13T09:15:00Z",
    userId: "2",
    isArchived: false,
  },
]

export const useNotes = () => {
  const { user } = useAuth()
  const { addNotification } = useNotification()
  const [allNotes, setAllNotes] = useState<Note[]>(MOCK_NOTES)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedNotes = localStorage.getItem(LOCAL_STORAGE_NOTES_KEY)
        if (storedNotes) {
          const parsed = JSON.parse(storedNotes)
          setAllNotes(parsed)
        } else {
          localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(MOCK_NOTES))
        }
      } catch (err: any) {
        console.error("Error loading notes:", err)
        setError("Failed to load notes from storage")
      }
      setLoading(false)
    }
  }, [])

  const fetchNotes = useCallback(async () => {
    if (!user) {
      setNotes([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 200))

      const userNotes = allNotes.filter((n) => n.userId === user.id)
      setNotes(userNotes)
    } catch (err: any) {
      console.error("Error fetching notes:", err)
      setError(err.message || "Failed to fetch notes.")
      addNotification({
        id: Date.now(),
        message: `Failed to fetch notes: ${err.message}`,
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }, [user, allNotes, addNotification])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  useEffect(() => {
    if (typeof window !== "undefined" && !loading) {
      localStorage.setItem(LOCAL_STORAGE_NOTES_KEY, JSON.stringify(allNotes))
    }
  }, [allNotes, loading])

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
        await new Promise((resolve) => setTimeout(resolve, 200))

        const newNote = {
          ...note,
          id: crypto.randomUUID(),
          userId: user.id,
          isArchived: false,
        }

        setAllNotes((prev) => [...prev, newNote])
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
        await new Promise((resolve) => setTimeout(resolve, 200))

        setAllNotes((prev) =>
          prev.map((n) => (n.id === id ? { ...n, ...updatedFields, updatedAt: new Date().toISOString() } : n)),
        )
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
        await new Promise((resolve) => setTimeout(resolve, 200))

        setAllNotes((prev) => prev.filter((n) => n.id !== id))
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

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    fetchNotes,
  }
}
