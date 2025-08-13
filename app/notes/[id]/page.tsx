"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useNotes } from "@/hooks/use-notes"
import { NoteEditor } from "@/components/note-editor"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function NoteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const noteId = params.id as string
  const { notes, loading, error, updateNote, deleteNote } = useNotes()
  const [currentNote, setCurrentNote] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (notes.length > 0) {
      const foundNote = notes.find((note) => note.id === noteId)
      setCurrentNote(foundNote)
    }
  }, [notes, noteId])

  const handleSave = async (content: string) => {
    if (!currentNote) return

    setIsSaving(true)
    setSaveError(null)
    try {
      await updateNote(noteId, { content, updatedAt: new Date().toISOString() })
      setSaveError(null) // Clear any previous save errors on success
    } catch (err: any) {
      setSaveError(err.message || "Failed to save note.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!currentNote) return

    if (window.confirm("Are you sure you want to delete this note?")) {
      setIsSaving(true) // Use isSaving to indicate deletion in progress
      setSaveError(null)
      try {
        await deleteNote(noteId)
        router.push("/notes") // Redirect to notes list after deletion
      } catch (err: any) {
        setSaveError(err.message || "Failed to delete note.")
      } finally {
        setIsSaving(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#222831] text-[#00ADB5]">
        <Loader2 className="h-12 w-12 animate-spin" />
        <span className="sr-only">Loading note...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <Alert variant="destructive" className="bg-red-900/20 border-red-700 text-red-400">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Error loading note: {error}</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4 button-gradient">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notes
        </Button>
      </div>
    )
  }

  if (!currentNote) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16 text-center text-[#EEEEEE]">
        <p className="text-xl">Note not found.</p>
        <Button onClick={() => router.back()} className="mt-4 button-gradient">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notes
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Notes
        </Button>
        <h1 className="text-3xl font-bold text-[#00ADB5]">{currentNote.title}</h1>
        <div className="flex space-x-2">
          <Button onClick={handleDelete} variant="destructive" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete Note
          </Button>
        </div>
      </div>

      {saveError && (
        <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-700 text-red-400">
          <AlertTitle>Save Error</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <Card className="card-gradient border-[#393E46]">
        <CardHeader>
          <CardTitle className="text-xl text-[#00ADB5]">Edit Note Content</CardTitle>
        </CardHeader>
        <CardContent>
          <NoteEditor initialContent={currentNote.content} onSave={handleSave} isSaving={isSaving} />
        </CardContent>
      </Card>
    </div>
  )
}
