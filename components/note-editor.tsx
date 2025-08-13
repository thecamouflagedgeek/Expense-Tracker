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
        className="min-h-[300px] bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] focus:ring-[#00ADB5] resize-none overflow-hidden"
      />
      <Button onClick={handleSaveClick} className="button-gradient self-end" disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" /> Save Note
          </>
        )}
      </Button>
    </div>
  )
}
