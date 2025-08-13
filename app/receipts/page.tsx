"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"
import { ReceiptUploadModal } from "@/components/receipt-upload-modal"
import { UploadDriveModal } from "@/components/upload-drive-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, FileText, ImageIcon, Trash2, Download, Lock, AlertTriangle, Upload, Filter } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { format } from "date-fns"
import { useRole } from "@/contexts/role-context"
import { useNotification } from "@/contexts/notification-context"

type Receipt = {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  description?: string
  uploadedAt: string
  userId: string
  fileData: string // Base64 encoded file data
  category: "Sponsor" | "Education" | "College" | "Other"
}

type Document = {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  category: "MOU" | "Deal" | "Contract" | "Other"
  uploadedBy: string
  uploadedAt: string
  fileData: string
}

const LOCAL_STORAGE_RECEIPTS_KEY = "ctrlfund_receipts"
const LOCAL_STORAGE_DOCUMENTS_KEY = "ctrlfund_documents"

export default function ReceiptsPage() {
  const { user } = useAuth()
  const { permissions, isAccountActive } = useRole()
  const { addNotification } = useNotification()
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [documentFilter, setDocumentFilter] = useState<string>("all")

  const [isDragging, setIsDragging] = useState(false)
  const [uploadingDocument, setUploadingDocument] = useState(false)

  const fetchReceipts = async () => {
    if (!user) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Simulate loading delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      const storedReceipts = localStorage.getItem(LOCAL_STORAGE_RECEIPTS_KEY)
      if (storedReceipts) {
        const allReceipts: Receipt[] = JSON.parse(storedReceipts)
        const userReceipts = allReceipts.filter((receipt) => receipt.userId === user.id)
        setReceipts(userReceipts)
      } else {
        setReceipts([])
      }

      const storedDocuments = localStorage.getItem(LOCAL_STORAGE_DOCUMENTS_KEY)
      if (storedDocuments) {
        setDocuments(JSON.parse(storedDocuments))
      } else {
        setDocuments([])
      }
    } catch (err: any) {
      console.error("Error fetching receipts:", err)
      setError(err.message || "Failed to fetch receipts.")
      addNotification({
        id: Date.now(),
        message: `Failed to fetch receipts: ${err.message}`,
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReceipts()
  }, [user])

  const updateReceiptCategory = async (id: string, category: Receipt["category"]) => {
    try {
      const storedReceipts = localStorage.getItem(LOCAL_STORAGE_RECEIPTS_KEY)
      if (storedReceipts) {
        const allReceipts: Receipt[] = JSON.parse(storedReceipts)
        const updatedReceipts = allReceipts.map((receipt) => (receipt.id === id ? { ...receipt, category } : receipt))
        localStorage.setItem(LOCAL_STORAGE_RECEIPTS_KEY, JSON.stringify(updatedReceipts))
        setReceipts((prev) => prev.map((receipt) => (receipt.id === id ? { ...receipt, category } : receipt)))

        addNotification({
          id: Date.now(),
          message: "Receipt category updated successfully!",
          type: "success",
        })
      }
    } catch (err: any) {
      console.error("Error updating receipt category:", err)
      addNotification({
        id: Date.now(),
        message: `Failed to update category: ${err.message}`,
        type: "error",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (user?.email !== "admin@ctrlfund.com") {
      addNotification({
        id: Date.now(),
        message: "Only the main admin can delete receipts.",
        type: "error",
      })
      return
    }
    if (window.confirm("Are you sure you want to delete this receipt?")) {
      setDeletingId(id)
      try {
        // Simulate deletion delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        const storedReceipts = localStorage.getItem(LOCAL_STORAGE_RECEIPTS_KEY)
        if (storedReceipts) {
          const allReceipts: Receipt[] = JSON.parse(storedReceipts)
          const updatedReceipts = allReceipts.filter((receipt) => receipt.id !== id)
          localStorage.setItem(LOCAL_STORAGE_RECEIPTS_KEY, JSON.stringify(updatedReceipts))
        }

        setReceipts((prev) => prev.filter((receipt) => receipt.id !== id))
        addNotification({
          id: Date.now(),
          message: "Receipt deleted successfully!",
          type: "success",
        })
      } catch (err: any) {
        console.error("Error deleting receipt:", err)
        setError(err.message || "Failed to delete receipt.")
        addNotification({
          id: Date.now(),
          message: `Failed to delete receipt: ${err.message}`,
          type: "error",
        })
      } finally {
        setDeletingId(null)
      }
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (user?.email !== "admin@ctrlfund.com") {
      addNotification({
        id: Date.now(),
        message: "Only the main admin can delete documents.",
        type: "error",
      })
      return
    }
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        const storedDocuments = localStorage.getItem(LOCAL_STORAGE_DOCUMENTS_KEY)
        if (storedDocuments) {
          const allDocuments: Document[] = JSON.parse(storedDocuments)
          const updatedDocuments = allDocuments.filter((doc) => doc.id !== id)
          localStorage.setItem(LOCAL_STORAGE_DOCUMENTS_KEY, JSON.stringify(updatedDocuments))
        }

        setDocuments((prev) => prev.filter((doc) => doc.id !== id))
        addNotification({
          id: Date.now(),
          message: "Document deleted successfully!",
          type: "success",
        })
      } catch (err: any) {
        console.error("Error deleting document:", err)
        addNotification({
          id: Date.now(),
          message: `Failed to delete document: ${err.message}`,
          type: "error",
        })
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (!permissions.canUploadReceipts) {
      addNotification({
        id: Date.now(),
        message: "You don't have permission to upload documents.",
        type: "error",
      })
      return
    }

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    setUploadingDocument(true)
    try {
      for (const file of files) {
        const reader = new FileReader()
        reader.onload = () => {
          const newDocument: Document = {
            id: crypto.randomUUID(),
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            category: "Other",
            uploadedBy: user?.name || "Unknown",
            uploadedAt: new Date().toISOString(),
            fileData: reader.result as string,
          }

          const storedDocuments = localStorage.getItem(LOCAL_STORAGE_DOCUMENTS_KEY)
          const allDocuments = storedDocuments ? JSON.parse(storedDocuments) : []
          const updatedDocuments = [...allDocuments, newDocument]
          localStorage.setItem(LOCAL_STORAGE_DOCUMENTS_KEY, JSON.stringify(updatedDocuments))
          setDocuments(updatedDocuments)
        }
        reader.readAsDataURL(file)
      }

      addNotification({
        id: Date.now(),
        message: `Successfully uploaded ${files.length} document(s)!`,
        type: "success",
      })
    } catch (err: any) {
      console.error("Error uploading documents:", err)
      addNotification({
        id: Date.now(),
        message: `Failed to upload documents: ${err.message}`,
        type: "error",
      })
    } finally {
      setUploadingDocument(false)
    }
  }

  const handleDownload = (receipt: Receipt | Document) => {
    // Create a download link for the base64 file data
    const link = document.createElement("a")
    link.href = receipt.fileData
    link.download = receipt.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("image")) {
      return <ImageIcon className="h-5 w-5 text-[#00ADB5]" />
    }
    if (fileType.includes("pdf")) {
      return <FileText className="h-5 w-5 text-[#00ADB5]" />
    }
    return <FileText className="h-5 w-5 text-[#00ADB5]" />
  }

  const filteredReceipts = receipts.filter((receipt) => categoryFilter === "all" || receipt.category === categoryFilter)

  const filteredDocuments = documents.filter((doc) => documentFilter === "all" || doc.category === documentFilter)

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

  if (!permissions.canViewReceipts) {
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
            You do not have permission to view receipts. Your access has been restricted by an administrator.
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
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
        <h1 className="text-4xl font-bold text-[#00ADB5]">Receipts & Documents</h1>
        <div className="flex flex-wrap justify-center gap-4">
          {permissions.canUploadReceipts && <ReceiptUploadModal />}
          {permissions.canUploadToDrive && <UploadDriveModal />}
        </div>
      </div>

      {!permissions.canUploadReceipts && (
        <Alert className="bg-orange-900/20 border-orange-700 text-orange-400 mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Limited Access</AlertTitle>
          <AlertDescription>
            You have read-only access to receipts. Contact an administrator to request upload permissions.
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] text-[#00ADB5]">
          <Loader2 className="h-12 w-12 animate-spin" />
          <span className="sr-only">Loading receipts...</span>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="bg-red-900/20 border-red-700 text-red-400">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="receipts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#393E46] border-[#00ADB5]">
            <TabsTrigger
              value="receipts"
              className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#222831]"
            >
              Receipts
            </TabsTrigger>
            <TabsTrigger
              value="documents"
              className="data-[state=active]:bg-[#00ADB5] data-[state=active]:text-[#222831]"
            >
              MOUs & Deals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="receipts" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#00ADB5]" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#393E46] border-[#00ADB5]">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Sponsor">Sponsor</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="College">College</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredReceipts.length === 0 ? (
              <div className="text-center text-[#EEEEEE]/70 py-8">
                <p>
                  {permissions.canUploadReceipts
                    ? "No receipts uploaded yet. Upload your first receipt!"
                    : "No receipts available to view."}
                </p>
              </div>
            ) : (
              <Card className="card-gradient border-[#393E46]">
                <CardHeader>
                  <CardTitle className="text-xl text-[#00ADB5]">Your Uploaded Receipts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#393E46]">
                          <TableHead className="text-[#00ADB5]">File Name</TableHead>
                          <TableHead className="text-[#00ADB5]">Category</TableHead>
                          <TableHead className="text-[#00ADB5]">Description</TableHead>
                          <TableHead className="text-[#00ADB5]">Type</TableHead>
                          <TableHead className="text-[#00ADB5]">Size</TableHead>
                          <TableHead className="text-[#00ADB5]">Uploaded At</TableHead>
                          <TableHead className="text-[#00ADB5] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReceipts.map((receipt) => (
                          <TableRow key={receipt.id} className="border-[#393E46] hover:bg-[#393E46]/50">
                            <TableCell className="font-medium text-[#EEEEEE] flex items-center gap-2">
                              {getFileIcon(receipt.fileType)} {receipt.fileName}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={receipt.category || "Other"}
                                onValueChange={(value) =>
                                  updateReceiptCategory(receipt.id, value as Receipt["category"])
                                }
                                disabled={!permissions.canUploadReceipts}
                              >
                                <SelectTrigger className="w-32 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE] text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#393E46] border-[#00ADB5]">
                                  <SelectItem value="Sponsor">Sponsor</SelectItem>
                                  <SelectItem value="Education">Education</SelectItem>
                                  <SelectItem value="College">College</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-[#EEEEEE]/80">{receipt.description || "-"}</TableCell>
                            <TableCell className="text-[#EEEEEE]/80">{receipt.fileType.split("/")[1]}</TableCell>
                            <TableCell className="text-[#EEEEEE]/80">
                              {(receipt.fileSize / 1024).toFixed(2)} KB
                            </TableCell>
                            <TableCell className="text-[#EEEEEE]/80">
                              {format(new Date(receipt.uploadedAt), "PPP")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDownload(receipt)}
                                  className="text-[#00ADB5] hover:bg-[#00ADB5]/20"
                                  title="Download Receipt"
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download Receipt</span>
                                </Button>
                                {user?.email === "admin@ctrlfund.com" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(receipt.id)}
                                    disabled={deletingId === receipt.id}
                                    className="text-red-400 hover:bg-red-900/20"
                                    title="Delete Receipt"
                                  >
                                    {deletingId === receipt.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">Delete Receipt</span>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#00ADB5]" />
                <Select value={documentFilter} onValueChange={setDocumentFilter}>
                  <SelectTrigger className="w-48 bg-[#393E46] border-[#00ADB5]/30 text-[#EEEEEE]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#393E46] border-[#00ADB5]">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="MOU">MOU</SelectItem>
                    <SelectItem value="Deal">Deal</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {permissions.canUploadReceipts && (
              <Card className="card-gradient border-[#393E46] mb-6">
                <CardContent className="p-6">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging ? "border-[#00ADB5] bg-[#00ADB5]/10" : "border-[#393E46] hover:border-[#00ADB5]/50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <Upload className="mx-auto h-12 w-12 text-[#00ADB5] mb-4" />
                    <h3 className="text-lg font-medium text-[#EEEEEE] mb-2">Upload MOUs & Deals</h3>
                    <p className="text-[#EEEEEE]/70 mb-4">Drag and drop your files here, or click to browse</p>
                    <Input
                      type="file"
                      multiple
                      className="hidden"
                      id="document-upload"
                      onChange={(e) => {
                        if (e.target.files) {
                          const fakeEvent = {
                            preventDefault: () => {},
                            dataTransfer: { files: e.target.files },
                          } as any
                          handleDrop(fakeEvent)
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      className="border-[#00ADB5] text-[#00ADB5] hover:bg-[#00ADB5]/10 bg-transparent"
                      onClick={() => document.getElementById("document-upload")?.click()}
                      disabled={uploadingDocument}
                    >
                      {uploadingDocument ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Browse Files"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {filteredDocuments.length === 0 ? (
              <div className="text-center text-[#EEEEEE]/70 py-8">
                <p>No documents uploaded yet. Upload your first document!</p>
              </div>
            ) : (
              <Card className="card-gradient border-[#393E46]">
                <CardHeader>
                  <CardTitle className="text-xl text-[#00ADB5]">MOUs & Deals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#393E46]">
                          <TableHead className="text-[#00ADB5]">File Name</TableHead>
                          <TableHead className="text-[#00ADB5]">Category</TableHead>
                          <TableHead className="text-[#00ADB5]">Uploaded By</TableHead>
                          <TableHead className="text-[#00ADB5]">Date</TableHead>
                          <TableHead className="text-[#00ADB5] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDocuments.map((document) => (
                          <TableRow key={document.id} className="border-[#393E46] hover:bg-[#393E46]/50">
                            <TableCell className="font-medium text-[#EEEEEE] flex items-center gap-2">
                              {getFileIcon(document.fileType)} {document.fileName}
                            </TableCell>
                            <TableCell className="text-[#EEEEEE]/80">{document.category}</TableCell>
                            <TableCell className="text-[#EEEEEE]/80">{document.uploadedBy}</TableCell>
                            <TableCell className="text-[#EEEEEE]/80">
                              {format(new Date(document.uploadedAt), "PPP")}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDownload(document)}
                                  className="text-[#00ADB5] hover:bg-[#00ADB5]/20"
                                  title="Download Document"
                                >
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download Document</span>
                                </Button>
                                {user?.email === "admin@ctrlfund.com" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteDocument(document.id)}
                                    className="text-red-400 hover:bg-red-900/20"
                                    title="Delete Document"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete Document</span>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  )
}
