"use client"

import { useNotes } from "@/hooks/use-notes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, FileText, Share2, Trash2, Edit, Archive, Undo2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"
import Link from "next/link"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { useRole } from "@/contexts/role-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type NoteItem = {
  id?: string
  title: string
  content: string
  updatedAt: string
  isArchived?: boolean
}

type NotesListProps = {
  notes: NoteItem[]
  selectedNoteId?: string | null
}

export function NotesList({ notes, selectedNoteId }: NotesListProps) {
  const { loading, error, deleteNote, setNoteArchived } = useNotes()
  const { permissions } = useRole()
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [sharedNoteUrl, setSharedNoteUrl] = useState("")

  const handleDelete = async (noteId: string) => {
    setDeletingNoteId(noteId)
    try {
      await deleteNote(noteId)
    } catch (err) {
      console.error("Failed to delete note:", err)
      alert("Failed to delete note.")
    } finally {
      setDeletingNoteId(null)
      setConfirmDeleteId(null)
    }
  }

  const handleArchive = async (noteId: string, isArchived: boolean) => {
    try {
      await setNoteArchived(noteId, !isArchived)
    } catch (err) {
      console.error("Failed to update note:", err)
      alert("Failed to update note.")
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
      <div className="flex items-center justify-center h-64 text-[#ccff00]">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
        <span className="sr-only">Loading notes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700 rounded-2xl p-4">
        <AlertTitle className="font-bold">Error</AlertTitle>
        <AlertDescription className="text-xs mt-0.5">Error loading notes: {error}</AlertDescription>
      </Alert>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="text-center text-black/45 font-semibold py-12 bg-white border border-black/5 rounded-3xl shadow-sm">
        <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-3">
          <FileText className="h-5 w-5 text-black/40" />
        </div>
        <p className="text-sm font-bold">No notes found.</p>
        <p className="text-xs text-black/40 mt-1">Create a note to start organizing your work.</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {notes.map((note) => (
          <Card key={note.id} className={`card-gradient border-none flex flex-col shadow-sm ${selectedNoteId === note.id ? "ring-2 ring-black/10" : ""}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-extrabold text-black flex items-center justify-between gap-2">
                <span className="truncate">{note.title}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-black/50 hover:text-black hover:bg-black/5 rounded-full w-8 h-8"
                    asChild
                    title="Open Note"
                  >
                    <Link href={`/notes?id=${note.id}`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Open Note</span>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-black/50 hover:text-black hover:bg-black/5 rounded-full w-8 h-8"
                    onClick={() => handleShare(note.id!)}
                    title="Share Note"
                  >
                    <Share2 className="h-4 w-4" />
                    <span className="sr-only">Share Note</span>
                  </Button>
                  {permissions.canArchiveNotes && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-black/50 hover:text-black hover:bg-black/5 rounded-full w-8 h-8"
                      onClick={() => handleArchive(note.id!, Boolean(note.isArchived))}
                      title={note.isArchived ? "Restore Note" : "Archive Note"}
                    >
                      {note.isArchived ? <Undo2 className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      <span className="sr-only">{note.isArchived ? "Restore Note" : "Archive Note"}</span>
                    </Button>
                  )}
                  {permissions.canDeleteNotes && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full w-8 h-8"
                      onClick={() => setConfirmDeleteId(note.id!)}
                      disabled={deletingNoteId === note.id}
                      title="Delete Note"
                    >
                      {deletingNoteId === note.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Delete Note</span>
                    </Button>
                  )}
                </div>
              </CardTitle>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-tight">Last updated: {format(new Date(note.updatedAt), "PPP")}</p>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-between">
              <p className="text-xs text-black/60 font-medium leading-relaxed line-clamp-4 mb-4">{note.content}</p>
              {note.isArchived && (
                <div className="text-[9px] font-bold text-black/45 uppercase tracking-wider">Archived</div>
              )}
              <Button
                asChild
                className="self-end button-gradient px-4 py-2 h-9 text-xs"
              >
                <Link href={`/notes?id=${note.id}`}>
                  <FileText className="mr-1.5 h-3.5 w-3.5 text-[#ccff00]" /> Read More
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={Boolean(confirmDeleteId)} onOpenChange={() => setConfirmDeleteId(null)}>
        <AlertDialogContent className="bg-white text-black border border-black/5 rounded-3xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-black">Delete note?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-black/60">
              This action permanently removes the note. You cannot undo this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white text-xs"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-[425px] w-[calc(100%-2rem)] sm:w-full max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto bg-white text-black border border-black/5 rounded-3xl shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-black">Share Note</DialogTitle>
            <DialogDescription className="text-xs text-black/60 font-medium">
              Anyone with this link will be able to view this note.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="share-link" className="text-right text-black/75 font-semibold text-xs">
                Link
              </Label>
              <Input
                id="share-link"
                value={sharedNoteUrl}
                readOnly
                className="col-span-3 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={copyToClipboard} className="button-gradient px-6 py-2.5 h-11 text-xs">
              Copy Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
