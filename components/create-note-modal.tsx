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
        <Button className="button-gradient">
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#222831] text-[#EEEEEE] border-[#00ADB5]">
        <DialogHeader>
          <DialogTitle className="text-[#00ADB5]">Create New Note</DialogTitle>
          <DialogDescription className="text-[#EEEEEE]/70">Fill in the details for your new note.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-[#EEEEEE]">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5]"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right text-[#EEEEEE]">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="col-span-3 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] min-h-[100px]"
                required
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-700 text-red-400">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="submit" className="button-gradient" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
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
