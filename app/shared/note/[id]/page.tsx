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
      <div className="flex flex-col items-center justify-center min-h-screen grid-bg-pattern text-black">
        <Loader2 className="h-10 w-10 animate-spin text-black stroke-[3]" />
        <span className="sr-only">Loading shared note...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen grid-bg-pattern p-4">
        <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700 rounded-2xl p-6 max-w-md shadow-lg">
          <AlertTitle className="font-bold text-lg">Error</AlertTitle>
          <AlertDescription className="text-xs mt-1 font-medium">{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center min-h-screen grid-bg-pattern p-4 text-black font-semibold text-lg">
        <p>Note not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen grid-bg-pattern font-sans antialiased text-black px-4 py-16 flex items-center justify-center">
      <Card className="card-gradient border border-black/5 rounded-[2rem] shadow-2xl max-w-3xl w-full p-8 md:p-12 relative overflow-hidden bg-white">
        <CardHeader className="text-center p-0 mb-8 border-b border-black/5 pb-8">
          <FileText className="mx-auto h-12 w-12 text-[#ccff00] fill-black stroke-2 mb-4" />
          <CardTitle className="text-3xl font-black text-black tracking-tight">{note.title}</CardTitle>
          <p className="text-xs text-black/50 font-semibold mt-2.5">
            Created: {format(new Date(note.createdAt), "PPP")}  •  Last Updated: {format(new Date(note.updatedAt), "PPP")}
          </p>
        </CardHeader>
        <CardContent className="p-0 text-black/85 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
          {note.content}
        </CardContent>
      </Card>
    </div>
  )
}
