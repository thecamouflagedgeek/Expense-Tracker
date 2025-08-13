"use client"

import { useState, useEffect } from "react"
import { useTransactions } from "@/hooks/use-transactions"
import { useNotes } from "@/hooks/use-notes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, ArchiveIcon, Trash2, Undo2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatCurrency, formatDate } from "@/utils/format-utils"
import { Badge } from "@/components/ui/badge"
import { useRole } from "@/contexts/role-context"

type ArchivedTransaction = {
  id: string
  title: string
  amount: number
  category: string
  date: string
  description?: string
  isArchived: boolean
}

type ArchivedNote = {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  isArchived: boolean
}

export default function ArchivePage() {
  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    updateTransaction,
    deleteTransaction,
  } = useTransactions()
  const { notes, loading: notesLoading, error: notesError, updateNote, deleteNote } = useNotes()
  const { permissions } = useRole()

  const [archivedTransactions, setArchivedTransactions] = useState<ArchivedTransaction[]>([])
  const [archivedNotes, setArchivedNotes] = useState<ArchivedNote[]>([])
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)

  useEffect(() => {
    setArchivedTransactions(transactions.filter((t) => (t as ArchivedTransaction).isArchived))
  }, [transactions])

  useEffect(() => {
    setArchivedNotes(notes.filter((n) => (n as ArchivedNote).isArchived))
  }, [notes])

  const handleRestoreTransaction = async (id: string) => {
    if (!permissions.canArchiveTransactions) {
      alert("You do not have permission to restore transactions.")
      return
    }
    setUpdatingItemId(id)
    try {
      await updateTransaction(id, { isArchived: false })
    } catch (err) {
      console.error("Failed to restore transaction:", err)
      alert("Failed to restore transaction.")
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleDeleteTransaction = async (id: string) => {
    if (!permissions.canDeleteTransactions) {
      alert("You do not have permission to permanently delete transactions.")
      return
    }
    if (window.confirm("Are you sure you want to permanently delete this transaction? This action cannot be undone.")) {
      setUpdatingItemId(id)
      try {
        await deleteTransaction(id)
      } catch (err) {
        console.error("Failed to delete transaction:", err)
        alert("Failed to delete transaction.")
      } finally {
        setUpdatingItemId(null)
      }
    }
  }

  const handleRestoreNote = async (id: string) => {
    if (!permissions.canArchiveNotes) {
      alert("You do not have permission to restore notes.")
      return
    }
    setUpdatingItemId(id)
    try {
      await updateNote(id, { isArchived: false })
    } catch (err) {
      console.error("Failed to restore note:", err)
      alert("Failed to restore note.")
    } finally {
      setUpdatingItemId(null)
    }
  }

  const handleDeleteNote = async (id: string) => {
    if (!permissions.canDeleteNotes) {
      alert("You do not have permission to permanently delete notes.")
      return
    }
    if (window.confirm("Are you sure you want to permanently delete this note? This action cannot be undone.")) {
      setUpdatingItemId(id)
      try {
        await deleteNote(id)
      } catch (err) {
        console.error("Failed to delete note:", err)
        alert("Failed to delete note.")
      } finally {
        setUpdatingItemId(null)
      }
    }
  }

  if (!permissions.canViewArchive) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-[#222831] text-[#EEEEEE]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-[#EEEEEE]/70">You do not have permission to view the Archive.</p>
        </div>
      </div>
    )
  }

  const loadingCombined = transactionsLoading || notesLoading
  const errorCombined = transactionsError || notesError

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-4xl font-bold text-[#00ADB5] mb-8 flex items-center">
        <ArchiveIcon className="mr-4 h-10 w-10" /> Archive
      </h1>

      {loadingCombined ? (
        <div className="flex items-center justify-center min-h-[300px] text-[#00ADB5]">
          <Loader2 className="h-12 w-12 animate-spin" />
          <span className="sr-only">Loading archive...</span>
        </div>
      ) : errorCombined ? (
        <Alert variant="destructive" className="bg-red-900/20 border-red-700 text-red-400">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorCombined}</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5]">
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#222831]"
            >
              Archived Transactions ({archivedTransactions.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#222831]">
              Archived Notes ({archivedNotes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="mt-4">
            <Card className="card-gradient border-[#393E46]">
              <CardHeader>
                <CardTitle className="text-xl text-[#00ADB5]">Archived Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                {archivedTransactions.length === 0 ? (
                  <p className="text-[#EEEEEE]/70 text-sm">No archived transactions.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#393E46]">
                          <TableHead className="text-[#00ADB5]">Title</TableHead>
                          <TableHead className="text-[#00ADB5]">Category</TableHead>
                          <TableHead className="text-[#00ADB5]">Amount</TableHead>
                          <TableHead className="text-[#00ADB5]">Date</TableHead>
                          <TableHead className="text-[#00ADB5] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {archivedTransactions.map((transaction) => (
                          <TableRow key={transaction.id} className="border-[#393E46] hover:bg-[#393E46]/50">
                            <TableCell className="font-medium text-[#EEEEEE]">{transaction.title}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-[#00ADB5]/20 text-[#00ADB5] border-[#00ADB5]/50">
                                {transaction.category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-[#EEEEEE]">{formatCurrency(transaction.amount)}</TableCell>
                            <TableCell className="text-[#EEEEEE]">{formatDate(transaction.date)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                {permissions.canArchiveTransactions && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRestoreTransaction(transaction.id)}
                                    disabled={updatingItemId === transaction.id}
                                    className="text-[#00ADB5] hover:bg-[#00ADB5]/20"
                                    title="Restore Transaction"
                                  >
                                    {updatingItemId === transaction.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Undo2 className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Restore Transaction</span>
                                  </Button>
                                )}
                                {permissions.canDeleteTransactions && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteTransaction(transaction.id)}
                                    disabled={updatingItemId === transaction.id}
                                    className="text-red-400 hover:bg-red-900/20"
                                    title="Permanently Delete Transaction"
                                  >
                                    {updatingItemId === transaction.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Permanently Delete Transaction</span>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <Card className="card-gradient border-[#393E46]">
              <CardHeader>
                <CardTitle className="text-xl text-[#00ADB5]">Archived Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {archivedNotes.length === 0 ? (
                  <p className="text-[#EEEEEE]/70 text-sm">No archived notes.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#393E46]">
                          <TableHead className="text-[#00ADB5]">Title</TableHead>
                          <TableHead className="text-[#00ADB5]">Last Updated</TableHead>
                          <TableHead className="text-[#00ADB5] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {archivedNotes.map((note) => (
                          <TableRow key={note.id} className="border-[#393E46] hover:bg-[#393E46]/50">
                            <TableCell className="font-medium text-[#EEEEEE]">{note.title}</TableCell>
                            <TableCell className="text-[#EEEEEE]">{formatDate(note.updatedAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                {permissions.canArchiveNotes && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRestoreNote(note.id)}
                                    disabled={updatingItemId === note.id}
                                    className="text-[#00ADB5] hover:bg-[#00ADB5]/20"
                                    title="Restore Note"
                                  >
                                    {updatingItemId === note.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Undo2 className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Restore Note</span>
                                  </Button>
                                )}
                                {permissions.canDeleteNotes && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteNote(note.id)}
                                    disabled={updatingItemId === note.id}
                                    className="text-red-400 hover:bg-red-900/20"
                                    title="Permanently Delete Note"
                                  >
                                    {updatingItemId === note.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Permanently Delete Note</span>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
