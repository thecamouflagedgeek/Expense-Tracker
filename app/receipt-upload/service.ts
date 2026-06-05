import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, Timestamp, collection, query, where, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore"
import { UploadLink, PendingReceipt } from "./types"

function getLocalLinks(): Record<string, any> {
  if (typeof window === "undefined") return {}
  const data = localStorage.getItem("ctrlfund_upload_links")
  return data ? JSON.parse(data) : {}
}

function saveLocalLink(linkId: string, linkData: any) {
  if (typeof window === "undefined") return
  const links = getLocalLinks()
  links[linkId] = {
    ...linkData,
    createdAt: linkData.createdAt.toMillis(),
    expiresAt: linkData.expiresAt.toMillis(),
  }
  localStorage.setItem("ctrlfund_upload_links", JSON.stringify(links))
}

function getLocalPendingReceipts(): Record<string, any> {
  if (typeof window === "undefined") return {}
  const data = localStorage.getItem("ctrlfund_pending_receipts")
  return data ? JSON.parse(data) : {}
}

function saveLocalPendingReceipt(receiptId: string, data: any) {
  if (typeof window === "undefined") return
  const receipts = getLocalPendingReceipts()
  receipts[receiptId] = data
  localStorage.setItem("ctrlfund_pending_receipts", JSON.stringify(receipts))
  window.dispatchEvent(new Event("pending-receipts-updated"))
}

export async function generateReceiptUploadLink(userId: string) {
  if (!userId) {
    throw new Error("User must be authenticated")
  }
  const linkId = crypto.randomUUID()
  const createdAt = Timestamp.now()
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000))
  const linkData: UploadLink = {
    ownerId: userId,
    linkId,
    status: "active",
    createdAt,
    expiresAt,
  }
  let fallback = false
  try {
    const linkDocRef = doc(db, "uploadLinks", linkId)
    await setDoc(linkDocRef, linkData)
  } catch (error) {
    saveLocalLink(linkId, linkData)
    fallback = true
  }
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const uploadUrl = `${origin}/receipt-upload/${linkId}`
  return {
    linkId,
    uploadUrl,
    expiresAt,
    fallback,
  }
}

export async function validateUploadLink(linkId: string): Promise<{ valid: boolean; ownerId?: string; fallback?: boolean }> {
  if (!linkId) {
    return { valid: false }
  }
  try {
    const linkDocRef = doc(db, "uploadLinks", linkId)
    const docSnap = await getDoc(linkDocRef)
    if (docSnap.exists()) {
      const data = docSnap.data() as UploadLink
      if (data.status !== "active") {
        return { valid: false }
      }
      const now = Timestamp.now()
      if (data.expiresAt.toMillis() <= now.toMillis()) {
        return { valid: false }
      }
      return {
        valid: true,
        ownerId: data.ownerId,
        fallback: false,
      }
    }
  } catch (error) {
  }
  const localLinks = getLocalLinks()
  const localData = localLinks[linkId]
  if (localData) {
    if (localData.status !== "active") {
      return { valid: false }
    }
    if (localData.expiresAt <= Date.now()) {
      return { valid: false }
    }
    return {
      valid: true,
      ownerId: localData.ownerId,
      fallback: true,
    }
  }
  return { valid: false }
}

export async function createPendingReceipt(receipt: Omit<PendingReceipt, "status">) {
  const data: PendingReceipt = {
    ...receipt,
    status: "pending",
  }
  let fallback = false
  try {
    const ref = doc(db, "pendingReceipts", data.id)
    await setDoc(ref, data)
  } catch (error) {
    saveLocalPendingReceipt(data.id, data)
    fallback = true
  }
  return { id: data.id, fallback }
}

export function subscribePendingReceipts(ownerId: string, callback: (receipts: PendingReceipt[]) => void) {
  let unsubscribed = false
  let firestoreUnsubscribe: (() => void) | null = null
  const checkLocal = () => {
    const local = getLocalPendingReceipts()
    const filtered = Object.values(local).filter((r: any) => r.ownerId === ownerId && r.status === "pending")
    callback(filtered as PendingReceipt[])
  }
  try {
    const q = query(
      collection(db, "pendingReceipts"),
      where("ownerId", "==", ownerId),
      where("status", "==", "pending")
    )
    firestoreUnsubscribe = onSnapshot(q, (snapshot) => {
      const receipts: PendingReceipt[] = []
      snapshot.forEach((doc) => {
        receipts.push(doc.data() as PendingReceipt)
      })
      callback(receipts)
    }, (err) => {
      if (!unsubscribed) {
        checkLocal()
        window.addEventListener("pending-receipts-updated", checkLocal)
      }
    })
  } catch (error) {
    checkLocal()
    window.addEventListener("pending-receipts-updated", checkLocal)
  }
  return () => {
    unsubscribed = true
    if (firestoreUnsubscribe) firestoreUnsubscribe()
    if (typeof window !== "undefined") {
      window.removeEventListener("pending-receipts-updated", checkLocal)
    }
  }
}

export async function approvePendingReceipt(receipt: PendingReceipt) {
  let fallback = false
  try {
    const ref = doc(db, "pendingReceipts", receipt.id)
    await updateDoc(ref, { status: "approved" })
  } catch (error) {
    const local = getLocalPendingReceipts()
    if (local[receipt.id]) {
      local[receipt.id].status = "approved"
      localStorage.setItem("ctrlfund_pending_receipts", JSON.stringify(local))
      window.dispatchEvent(new Event("pending-receipts-updated"))
    }
    fallback = true
  }
  if (typeof window !== "undefined") {
    const permanentReceipt = {
      id: receipt.id,
      userId: receipt.ownerId,
      fileName: receipt.fileName,
      fileType: receipt.fileType,
      fileSize: receipt.fileSize,
      description: receipt.description,
      uploadedAt: receipt.uploadedAt,
      fileData: receipt.fileData,
    }
    const existing = JSON.parse(localStorage.getItem("ctrlfund_receipts") || "[]")
    localStorage.setItem("ctrlfund_receipts", JSON.stringify([...existing, permanentReceipt]))
    window.dispatchEvent(new Event("receipts-updated"))
  }
  return { id: receipt.id, fallback }
}

export async function rejectPendingReceipt(receiptId: string) {
  let fallback = false
  try {
    const ref = doc(db, "pendingReceipts", receiptId)
    await deleteDoc(ref)
  } catch (error) {
    const local = getLocalPendingReceipts()
    if (local[receiptId]) {
      delete local[receiptId]
      localStorage.setItem("ctrlfund_pending_receipts", JSON.stringify(local))
      window.dispatchEvent(new Event("pending-receipts-updated"))
    }
    fallback = true
  }
  return { id: receiptId, fallback }
}
