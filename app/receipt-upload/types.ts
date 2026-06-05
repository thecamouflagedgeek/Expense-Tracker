import { Timestamp } from "firebase/firestore"

export type UploadLink = {
  ownerId: string
  linkId: string
  status: "active"
  createdAt: Timestamp
  expiresAt: Timestamp
}

export type PendingReceipt = {
  id: string
  linkId: string
  ownerId: string
  fileName: string
  fileType: string
  fileSize: number
  description: string
  uploadedAt: string
  fileData: string
  status: "pending" | "approved" | "rejected"
}
