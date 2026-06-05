import { Timestamp } from "firebase/firestore"

export type UploadLink = {
  ownerId: string
  linkId: string
  status: "active"
  createdAt: Timestamp
  expiresAt: Timestamp
}
