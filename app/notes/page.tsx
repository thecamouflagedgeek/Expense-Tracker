"use client"

import { motion } from "framer-motion"
import { useMemo, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CreateNoteModal } from "@/components/create-note-modal"
import { NotesList } from "@/components/notes-list"
import { NoteEditor } from "@/components/note-editor"
import { useNotes } from "@/hooks/use-notes"
import { useRole } from "@/contexts/role-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { generateNotesPdf } from "@/utils/pdf-utils"
import { Download, Lock, AlertTriangle, Search, ArrowLeft, Save } from "lucide-react"

export default function NotesPage() {
  const { notes, updateNote } = useNotes()
  const { permissions, isAccountActive } = useRole()
  const search = useSearchParams()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [query, setQuery] = useState("")
  const [mobileContent, setMobileContent] = useState("")

  const noteId = search.get("id")
  const view = search.get("view") === "archived" ? "archived" : "active"
  const selectedNote = useMemo(() => notes.find((n) => n.id === noteId), [notes, noteId])

  useEffect(() => {
    if (selectedNote) {
      setMobileContent(selectedNote.content)
    } else {
      setMobileContent("")
    }
  }, [selectedNote])

  const filteredNotes = useMemo(() => {
    const targetArchived = view === "archived"
    return notes
      .filter((n) => Boolean(n.isArchived) === targetArchived)
      .filter((n) =>
        n.title.toLowerCase().includes(query.toLowerCase()) ||
        n.content.toLowerCase().includes(query.toLowerCase()),
      )
  }, [notes, view, query])

  const closeDetail = () => {
    const p = new URLSearchParams(search.toString())
    p.delete("id")
    router.replace(`/notes?${p.toString()}`)
  }

  const setView = (nextView: "active" | "archived") => {
    const p = new URLSearchParams(search.toString())
    p.set("view", nextView)
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

  const handleMobileSave = async () => {
    if (!selectedNote?.id) return
    setSaving(true)
    try {
      await updateNote(selectedNote.id, { content: mobileContent })
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
            This account is temporarily paused. Please contact support to reactivate your workspace.
          </p>
          <div className="text-xs text-black/40 font-semibold">
            If you believe this is an error, support can help restore access.
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
            Notes are not available for this account right now.
          </p>
          <div className="text-xs text-black/40 font-semibold">
            Contact support if you need help with this workspace.
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
        <div>
          <h1 className="text-2xl font-black tracking-tight text-black">Your Notes</h1>
          <p className="text-xs text-black/50 font-semibold">Search, organize, and track key updates.</p>
        </div>
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

      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-6">
        <div className="flex w-full md:w-auto bg-white/70 p-1.5 rounded-full border border-black/5 shadow-sm">
          <button
            onClick={() => setView("active")}
            className={`flex-1 md:flex-none px-5 py-2 rounded-full text-xs font-black transition-all duration-200 ${
              view === "active" ? "bg-black text-[#ccff00] shadow-sm" : "text-black/50 hover:text-black"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setView("archived")}
            className={`flex-1 md:flex-none px-5 py-2 rounded-full text-xs font-black transition-all duration-200 ${
              view === "archived" ? "bg-black text-[#ccff00] shadow-sm" : "text-black/50 hover:text-black"
            }`}
          >
            Archived
          </button>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes..."
            className="pl-9 bg-white text-black border border-black/5 hover:bg-black/[0.02] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 font-semibold shadow-sm placeholder:text-black/30"
          />
        </div>
      </div>

      {(!permissions.canEditNotes || !permissions.canCreateNotes) && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-800 rounded-2xl p-4 mb-6 shadow-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="font-bold">Limited Access</AlertTitle>
          <AlertDescription className="text-xs mt-0.5">
            {!permissions.canEditNotes && !permissions.canCreateNotes
              ? "Notes are currently read-only for this account."
              : !permissions.canEditNotes
                ? "You can create new notes but cannot edit existing ones."
                : "You can edit notes but cannot create new ones."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <NotesList notes={filteredNotes} selectedNoteId={noteId} />
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
              <NoteEditor
                initialContent={selectedNote.content}
                onSave={handleSave}
                isSaving={saving}
                showActions={permissions.canEditNotes}
                readOnly={!permissions.canEditNotes}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-black/40 font-semibold">
              Select a note to view or edit details
            </div>
          )}
        </div>
      </div>

      {selectedNote && (
        <div className="fixed inset-0 z-50 bg-[#eff1e9] lg:hidden flex flex-col">
          <div className="sticky top-0 z-10 bg-[#eff1e9]/95 backdrop-blur border-b border-black/5 px-4 py-4 flex items-center gap-3">
            <button
              onClick={closeDetail}
              className="w-9 h-9 rounded-full bg-white border border-black/10 flex items-center justify-center text-black"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider">Note</p>
              <h2 className="text-sm font-black text-black truncate">{selectedNote.title}</h2>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
            <NoteEditor
              initialContent={selectedNote.content}
              onSave={handleMobileSave}
              isSaving={saving}
              showActions={false}
              value={mobileContent}
              onContentChange={setMobileContent}
              textareaClassName="min-h-[60vh]"
              readOnly={!permissions.canEditNotes}
            />
          </div>

          {permissions.canEditNotes && (
            <div className="fixed bottom-0 left-0 right-0 z-10 bg-[#eff1e9]/95 backdrop-blur border-t border-black/5 px-4 py-3">
              <Button
                onClick={handleMobileSave}
                className="button-gradient w-full h-11 text-xs"
                disabled={saving}
              >
                {saving ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4 text-[#ccff00]" /> Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
