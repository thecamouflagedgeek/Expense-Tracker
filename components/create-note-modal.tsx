"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useNotes } from "@/hooks/use-notes"
import { Loader2, PlusCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function CreateNoteModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { createNote } = useNotes()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await createNote({
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      setIsOpen(false)
      setTitle("")
      setContent("")
    } catch (err: any) {
      setError(err.message || "Failed to create note.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="button-gradient px-5 py-2 h-11 text-xs">
          <PlusCircle className="mr-2 h-4 w-4 text-[#ccff00]" /> Create New Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[calc(100%-2rem)] sm:w-full max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto bg-white text-black border border-black/5 rounded-3xl shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-black">Create New Note</DialogTitle>
          <DialogDescription className="text-xs text-black/60 font-medium">Fill in the details for your new note.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-black/75 font-semibold text-xs">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right text-black/75 font-semibold text-xs mt-2.5">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="col-span-3 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-2xl p-4 text-xs font-medium placeholder:text-black/30 min-h-[120px]"
                required
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-700 rounded-2xl p-4">
              <AlertTitle className="font-bold">Error</AlertTitle>
              <AlertDescription className="text-xs mt-0.5">{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="submit" className="button-gradient px-6 py-2.5 h-11 text-xs" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#ccff00]" /> Creating...
                </>
              ) : (
                "Create Note"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
