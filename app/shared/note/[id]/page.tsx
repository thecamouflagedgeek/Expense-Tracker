"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Loader2, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"

type Note = {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  userId: string
}

const LOCAL_STORAGE_NOTES_KEY = "ctrlfund_notes"

export default function SharedNotePage() {
  const params = useParams()
  const noteId = params.id as string
  const [note, setNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSharedNote = async () => {
      if (!noteId) {
        setError("Note ID is missing.")
        setLoading(false)
        return
      }

      try {
        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Get notes from localStorage
        const storedNotes = localStorage.getItem(LOCAL_STORAGE_NOTES_KEY)
        if (!storedNotes) {
          setError("Note not found.")
          setLoading(false)
          return
        }

        const notes: Note[] = JSON.parse(storedNotes)
        const foundNote = notes.find((n) => n.id === noteId)

        if (foundNote) {
          setNote(foundNote)
        } else {
          setError("Note not found or access denied.")
        }
      } catch (err: any) {
        console.error("Error fetching shared note:", err)
        setError(err.message || "Failed to load note.")
      } finally {
        setLoading(false)
      }
    }

    fetchSharedNote()
  }, [noteId])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#222831] text-[#00ADB5]">
        <Loader2 className="h-12 w-12 animate-spin" />
        <span className="sr-only">Loading shared note...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#222831] p-4">
        <Alert variant="destructive" className="bg-red-900/20 border-red-700 text-red-400 max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#222831] p-4 text-[#EEEEEE]">
        <p className="text-xl">Note not found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-[#222831] text-[#EEEEEE]">
      <Card className="card-gradient border-[#00ADB5] max-w-3xl mx-auto">
        <CardHeader className="text-center">
          <FileText className="mx-auto h-12 w-12 text-[#00ADB5] mb-4" />
          <CardTitle className="text-3xl font-bold text-[#00ADB5]">{note.title}</CardTitle>
          <p className="text-sm text-[#EEEEEE]/70">
            Created: {format(new Date(note.createdAt), "PPP")} | Last Updated: {format(new Date(note.updatedAt), "PPP")}
          </p>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none text-[#EEEEEE] leading-relaxed">
          <p>{note.content}</p>
        </CardContent>
      </Card>
    </div>
  )
}
