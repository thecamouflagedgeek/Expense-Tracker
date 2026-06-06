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
  ownerId: string
  linkId: string
  fileName: string
  fileType: string
  fileSize: number
  imageData: string
  description: string
  uploadedAt: Timestamp
  status: "pending" | "approved" | "rejected"
}
