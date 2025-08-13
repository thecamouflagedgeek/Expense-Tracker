"use client"

import { motion } from "framer-motion"
import { CreateNoteModal } from "@/components/create-note-modal"
import { NotesList } from "@/components/notes-list"
import { useNotes } from "@/hooks/use-notes"
import { useRole } from "@/contexts/role-context"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { generateNotesPdf } from "@/utils/pdf-utils"
import { Download, Lock, AlertTriangle } from "lucide-react"

export default function NotesPage() {
  const { notes } = useNotes()
  const { permissions, isAccountActive } = useRole()

  const handleExportNotes = () => {
    generateNotesPdf(notes)
  }

  if (!isAccountActive) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#222831] text-[#EEEEEE]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-orange-400 mb-2">Account Inactive</h2>
          <p className="text-[#EEEEEE]/70 mb-4">
            Your account has been deactivated by an administrator. Please contact support to reactivate your account.
          </p>
          <div className="text-sm text-[#EEEEEE]/50">
            If you believe this is an error, please reach out to your system administrator.
          </div>
        </motion.div>
      </div>
    )
  }

  if (!permissions.canViewNotes) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#222831] text-[#EEEEEE]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-[#EEEEEE]/70 mb-4">
            You do not have permission to view notes. Your access has been restricted by an administrator.
          </p>
          <div className="text-sm text-[#EEEEEE]/50">
            Contact your administrator if you need access to this feature.
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8 mt-16"
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold text-[#00ADB5]">Your Notes</h1>
        <div className="flex space-x-4">
          <Button
            onClick={handleExportNotes}
            variant="outline"
            className="border-[#393E46] text-[#EEEEEE] hover:bg-[#00ADB5]/20 hover:text-[#00ADB5] bg-transparent"
          >
            <Download className="mr-2 h-4 w-4" /> Export to PDF
          </Button>
          {permissions.canCreateNotes && <CreateNoteModal />}
        </div>
      </div>

      {(!permissions.canEditNotes || !permissions.canCreateNotes) && (
        <Alert className="bg-orange-900/20 border-orange-700 text-orange-400 mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limited Access</AlertTitle>
          <AlertDescription>
            {!permissions.canEditNotes && !permissions.canCreateNotes
              ? "You have read-only access to notes. Contact an administrator to request editing permissions."
              : !permissions.canEditNotes
                ? "You can create new notes but cannot edit existing ones."
                : "You can edit notes but cannot create new ones."}
          </AlertDescription>
        </Alert>
      )}

      <NotesList />
    </motion.div>
  )
}
