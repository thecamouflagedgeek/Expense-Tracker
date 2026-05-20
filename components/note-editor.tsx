"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"

type NoteEditorProps = {
  initialContent: string
  onSave: (content: string) => void
  isSaving: boolean
}

export function NoteEditor({ initialContent, onSave, isSaving }: NoteEditorProps) {
  const [content, setContent] = useState(initialContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setContent(initialContent)
  }, [initialContent])

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [content])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  const handleSaveClick = () => {
    onSave(content)
  }

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={handleContentChange}
        placeholder="Start writing your note here..."
        className="min-h-[300px] bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-2xl p-4 text-xs font-medium placeholder:text-black/30 resize-none overflow-hidden"
      />
      <Button onClick={handleSaveClick} className="button-gradient self-end px-5 py-2.5 h-11 text-xs" disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#ccff00]" /> Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4 text-[#ccff00]" /> Save Note
          </>
        )}
      </Button>
    </div>
  )
}
