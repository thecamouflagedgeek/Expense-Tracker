"use client"

import { useNotes } from "@/hooks/use-notes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, Share2, Trash2, Edit } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"
import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

export function NotesList() {
  const { notes, loading, error, deleteNote } = useNotes()
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [sharedNoteUrl, setSharedNoteUrl] = useState("")

  const handleDelete = async (noteId: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setDeletingNoteId(noteId)
      try {
        await deleteNote(noteId)
      } catch (err) {
        console.error("Failed to delete note:", err)
        alert("Failed to delete note.")
      } finally {
        setDeletingNoteId(null)
      }
    }
  }

  const handleShare = (noteId: string) => {
    const url = `${window.location.origin}/shared/note/${noteId}`
    setSharedNoteUrl(url)
    setShareModalOpen(true)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sharedNoteUrl)
    alert("Link copied to clipboard!")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-[#00ADB5]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="sr-only">Loading notes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-900/20 border-red-700 text-red-400">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Error loading notes: {error}</AlertDescription>
      </Alert>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="text-center text-[#EEEEEE]/70 py-8">
        <p>No notes found. Create your first note!</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Card key={note.id} className="card-gradient border-[#393E46] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-[#00ADB5] flex items-center justify-between">
                <span className="truncate">{note.title}</span>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#00ADB5] hover:bg-[#00ADB5]/20"
                    asChild
                    title="Edit Note"
                  >
                    <Link href={`/notes/${note.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit Note</span>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-[#00ADB5] hover:bg-[#00ADB5]/20"
                    onClick={() => handleShare(note.id)}
                    title="Share Note"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share Note</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:bg-red-900/20"
                    onClick={() => handleDelete(note.id)}
                    disabled={deletingNoteId === note.id}
                    title="Delete Note"
                  >
                    {deletingNoteId === note.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="sr-only">Delete Note</span>
                  </Button>
                </div>
              </CardTitle>
              <p className="text-xs text-[#EEEEEE]/70">Last updated: {format(new Date(note.updatedAt), "PPP")}</p>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <p className="text-sm text-[#EEEEEE] line-clamp-4 mb-4">{note.content}</p>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="self-end border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
              >
                <Link href={`/notes/${note.id}`}>
                  <FileText className="mr-2 h-4 w-4" /> Read More
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#222831] text-[#EEEEEE] border-[#00ADB5]">
          <DialogHeader>
            <DialogTitle className="text-[#00ADB5]">Share Note</DialogTitle>
            <DialogDescription className="text-[#EEEEEE]/70">
              Anyone with this link will be able to view this note.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="share-link" className="text-right text-[#EEEEEE]">
                Link
              </Label>
              <Input
                id="share-link"
                value={sharedNoteUrl}
                readOnly
                className="col-span-3 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={copyToClipboard} className="button-gradient">
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
