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
  showActions?: boolean
  textareaClassName?: string
  value?: string
  onContentChange?: (value: string) => void
  readOnly?: boolean
}

export function NoteEditor({
  initialContent,
  onSave,
  isSaving,
  showActions = true,
  textareaClassName = "",
  value,
  onContentChange,
  readOnly = false,
}: NoteEditorProps) {
  const [content, setContent] = useState(initialContent)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isControlled = typeof value === "string"
  const resolvedContent = isControlled ? value : content

  useEffect(() => {
    if (!isControlled) {
      setContent(initialContent)
    }
  }, [initialContent])

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [resolvedContent])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onContentChange) {
      onContentChange(e.target.value)
    }
    if (!isControlled) {
      setContent(e.target.value)
    }
  }

  const handleSaveClick = () => {
    onSave(resolvedContent)
  }

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        ref={textareaRef}
        value={resolvedContent}
        onChange={handleContentChange}
        placeholder="Start writing your note here..."
        readOnly={readOnly}
        className={`min-h-[300px] bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-2xl p-4 text-xs font-medium placeholder:text-black/30 resize-none overflow-hidden ${readOnly ? "cursor-not-allowed bg-black/[0.01]" : ""} ${textareaClassName}`}
      />
      {showActions && (
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
      )}
    </div>
  )
}
