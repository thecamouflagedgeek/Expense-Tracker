"use client"

import { motion } from "framer-motion"
import { useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CreateNoteModal } from "@/components/create-note-modal"
import { NotesList } from "@/components/notes-list"
import { NoteEditor } from "@/components/note-editor"
import { useNotes } from "@/hooks/use-notes"
import { useRole } from "@/contexts/role-context"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { generateNotesPdf } from "@/utils/pdf-utils"
import { Download, Lock, AlertTriangle } from "lucide-react"

export default function NotesPage() {
  const { notes, updateNote } = useNotes()
  const { permissions, isAccountActive } = useRole()
  const search = useSearchParams()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const noteId = search.get("id")
  const selectedNote = useMemo(() => notes.find((n) => n.id === noteId), [notes, noteId])

  const closeDetail = () => {
    const p = new URLSearchParams(search.toString())
    p.delete("id")
    router.replace(`/notes?${p.toString()}`)
  }

  const handleSave = async (content: string) => {
    if (!selectedNote?.id) return
    setSaving(true)
    try {
      await updateNote(selectedNote.id, { content })
    } finally {
      setSaving(false)
    }
  }

  const handleExportNotes = () => {
    generateNotesPdf(notes)
  }

  if (!isAccountActive) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#eff1e9] text-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8 bg-white border border-black/5 rounded-3xl shadow-xl"
        >
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-black text-orange-600 mb-2">Account Inactive</h2>
          <p className="text-black/60 text-sm mb-4">
            Your account has been deactivated by an administrator. Please contact support to reactivate your account.
          </p>
          <div className="text-xs text-black/40 font-semibold">
            If you believe this is an error, please reach out to your system administrator.
          </div>
        </motion.div>
      </div>
    )
  }

  if (!permissions.canViewNotes) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#eff1e9] text-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8 bg-white border border-black/5 rounded-3xl shadow-xl"
        >
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-red-500 mb-2">Access Denied</h2>
          <p className="text-black/60 text-sm mb-4">
            You do not have permission to view notes. Your access has been restricted by an administrator.
          </p>
          <div className="text-xs text-black/40 font-semibold">
            Contact your administrator if you need access to this feature.
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto px-4 md:px-8 pt-6 md:pt-8 pb-8"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-black tracking-tight text-black">Your Notes</h1>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleExportNotes}
            className="button-gradient px-5 py-2 h-11 text-xs"
          >
            <Download className="mr-2 h-4 w-4 text-[#ccff00]" /> Export to PDF
          </Button>
          {permissions.canCreateNotes && <CreateNoteModal />}
        </div>
      </div>

      {(!permissions.canEditNotes || !permissions.canCreateNotes) && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-800 rounded-2xl p-4 mb-6 shadow-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="font-bold">Limited Access</AlertTitle>
          <AlertDescription className="text-xs mt-0.5">
            {!permissions.canEditNotes && !permissions.canCreateNotes
              ? "You have read-only access to notes. Contact an administrator to request editing permissions."
              : !permissions.canEditNotes
                ? "You can create new notes but cannot edit existing ones."
                : "You can edit notes but cannot create new ones."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <NotesList />
        <div className="hidden lg:block card-gradient border border-black/5 p-6 min-h-[400px] relative">
          {selectedNote ? (
            <>
              <button
                onClick={closeDetail}
                className="absolute right-4 top-4 text-xs text-black/50 hover:text-black font-semibold bg-black/5 hover:bg-black/10 px-3 py-1.5 rounded-full transition-colors"
              >
                Close
              </button>
              <h2 className="text-xl font-extrabold text-black mb-6 pr-16 truncate">{selectedNote.title}</h2>
              <NoteEditor initialContent={selectedNote.content} onSave={handleSave} isSaving={saving} />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-black/40 font-semibold">
              Select a note to view or edit details
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
