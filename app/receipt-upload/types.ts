import { Timestamp } from "firebase/firestore"

export type UploadLink = {
  ownerId: string
  linkId: string
  status: "active"
  createdAt: Timestamp
  expiresAt: Timestamp
}
export type PendingUploader = {
  id: string
  linkId: string
  ownerId: string
  name: string
  status: "pending" | "approved" | "rejected"
  createdAt: Timestamp
}
