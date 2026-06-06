import { db } from "@/lib/firebase"
import { doc, getDoc, setDoc, Timestamp, collection, addDoc, query, where, onSnapshot, deleteDoc } from "firebase/firestore"
import { UploadLink, PendingReceipt } from "./types"

function getMillis(timestamp: any): number {
  if (!timestamp) return 0
  if (typeof timestamp.toMillis === "function") {
    return timestamp.toMillis()
  }
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().getTime()
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime()
  }
  if (typeof timestamp === "number") {
    return timestamp
  }
  if (typeof timestamp.seconds === "number") {
    return timestamp.seconds * 1000 + Math.floor((timestamp.nanoseconds || 0) / 1000000)
  }
  if (typeof timestamp === "string") {
    return new Date(timestamp).getTime()
  }
  return 0
}

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
    createdAt: getMillis(linkData.createdAt),
    expiresAt: getMillis(linkData.expiresAt),
  }
  localStorage.setItem("ctrlfund_upload_links", JSON.stringify(links))
}

export async function generateReceiptUploadLink(userId: string) {
  console.log("[Receipt System] generateReceiptUploadLink started for user: " + userId)
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
  saveLocalLink(linkId, linkData)
  let fallback = false
  try {
    const linkDocRef = doc(db, "uploadLinks", linkId)
    await setDoc(linkDocRef, linkData)
    console.log("[Receipt System] Link generated and saved to Firestore: " + linkId)
  } catch (error) {
    console.error("[Receipt System] Firestore link write failed, using local storage fallback", error)
    fallback = true
  }
  const origin = typeof window !== "undefined" ? window.location.origin : ""
  const uploadUrl = `${origin}/upload/${linkId}`
  return {
    linkId,
    uploadUrl,
    expiresAt,
    fallback,
  }
}

export async function validateUploadLink(linkId: string): Promise<{ valid: boolean; ownerId?: string; fallback?: boolean }> {
  console.log("[Receipt System] validateUploadLink started for link: " + linkId)
  if (!linkId) {
    return { valid: false }
  }
  try {
    const linkDocRef = doc(db, "uploadLinks", linkId)
    const docSnap = await getDoc(linkDocRef)
    if (docSnap.exists()) {
      const data = docSnap.data() as UploadLink
      if (data.status !== "active") {
        console.log("[Receipt System] Link status is not active: " + data.status)
        return { valid: false }
      }
      const expiresAtMillis = getMillis(data.expiresAt)
      if (expiresAtMillis <= Date.now()) {
        console.log("[Receipt System] Link has expired at: " + expiresAtMillis)
        return { valid: false }
      }
      console.log("[Receipt System] Link validated successfully against Firestore. Owner: " + data.ownerId)
      return {
        valid: true,
        ownerId: data.ownerId,
        fallback: false,
      }
    }
  } catch (error) {
    console.error("[Receipt System] Firestore read failed during validation, trying fallback", error)
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
    console.log("[Receipt System] Link validated successfully against Local Storage. Owner: " + localData.ownerId)
    return {
      valid: true,
      ownerId: localData.ownerId,
      fallback: true,
    }
  }
  console.log("[Receipt System] Link validation failed.")
  return { valid: false }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

export async function uploadReceiptToFirebase(
  ownerId: string,
  linkId: string,
  file: File,
  description: string
) {
  console.log("[Receipt System] uploadReceiptToFirebase started. File size: " + file.size)
  
  let imageData = ""
  try {
    imageData = await fileToBase64(file)
    console.log("[Receipt System] File converted to Base64 successfully.")
  } catch (conversionError: any) {
    console.error("[Receipt System] Base64 conversion failed.", conversionError)
    throw new Error("Base64 conversion failed: " + (conversionError.message || conversionError))
  }

  const receiptId = crypto.randomUUID()
  const pendingReceiptData: PendingReceipt = {
    id: receiptId,
    ownerId,
    linkId,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    imageData,
    description,
    uploadedAt: Timestamp.now(),
    status: "pending"
  }

  console.log("[Receipt System] Writing pending receipt document to Firestore: " + receiptId)
  try {
    await setDoc(doc(db, "pendingReceipts", receiptId), pendingReceiptData)
    console.log("[Receipt System] Pending receipt doc written successfully to Firestore.")
  } catch (firestoreError: any) {
    console.error("[Receipt System] Failed to write pending receipt document to Firestore.", firestoreError)
    throw new Error("Firestore doc write failed: " + (firestoreError.message || firestoreError))
  }

  return { success: true }
}

export function subscribePendingReceipts(ownerId: string, callback: (receipts: PendingReceipt[]) => void) {
  console.log("[Receipt System] Subscribing to pending receipts for owner: " + ownerId)
  try {
    const q = query(
      collection(db, "pendingReceipts"),
      where("ownerId", "==", ownerId),
      where("status", "==", "pending")
    )
    return onSnapshot(q, (snapshot) => {
      const receipts: PendingReceipt[] = []
      snapshot.forEach((doc) => {
        receipts.push(doc.data() as PendingReceipt)
      })
      console.log(`[Receipt System] Snapshot update received: ${receipts.length} pending receipts.`)
      callback(receipts)
    }, (err) => {
      console.error("[Receipt System] Error in pendingReceipts snapshot subscription: ", err)
    })
  } catch (error) {
    console.error("[Receipt System] Failed to initialize pendingReceipts snapshot subscription: ", error)
    return () => {}
  }
}

export async function approvePendingReceipt(receipt: PendingReceipt) {
  console.log("[Receipt System] Approving pending receipt: " + receipt.id)
  try {
    const finalReceiptData = {
      ownerId: receipt.ownerId,
      fileName: receipt.fileName,
      fileType: receipt.fileType,
      fileSize: receipt.fileSize,
      imageData: receipt.imageData,
      description: receipt.description,
      uploadedAt: receipt.uploadedAt,
      uploadedViaLink: true,
      linkId: receipt.linkId
    }
    console.log("[Receipt System] Adding final receipt to Firestore receipts collection")
    const docRef = await addDoc(collection(db, "receipts"), finalReceiptData)
    console.log("[Receipt System] Final receipt added successfully to Firestore. ID: " + docRef.id)
    console.log("[Receipt System] Deleting pending receipt document: " + receipt.id)
    await deleteDoc(doc(db, "pendingReceipts", receipt.id))
    console.log("[Receipt System] Pending receipt deleted from Firestore.")
    if (typeof window !== "undefined") {
      const permanentReceipt = {
        id: docRef.id,
        userId: receipt.ownerId,
        fileName: receipt.fileName,
        fileType: receipt.fileType,
        fileSize: receipt.fileSize,
        description: receipt.description,
        uploadedAt: receipt.uploadedAt instanceof Timestamp ? receipt.uploadedAt.toDate().toISOString() : new Date().toISOString(),
        fileData: receipt.imageData,
      }
      const existing = JSON.parse(localStorage.getItem("ctrlfund_receipts") || "[]")
      if (!existing.some((r: any) => r.id === docRef.id)) {
        localStorage.setItem("ctrlfund_receipts", JSON.stringify([...existing, permanentReceipt]))
        window.dispatchEvent(new Event("receipts-updated"))
        console.log("[Receipt System] Permanent receipt saved to local storage.")
      } else {
        console.log("[Receipt System] Permanent receipt already exists in local storage, skipping duplicate.")
      }
    }
  } catch (error) {
    console.error("[Receipt System] Error during receipt approval: ", error)
    throw error
  }
}

export async function rejectPendingReceipt(receiptId: string) {
  console.log("[Receipt System] Rejecting pending receipt: " + receiptId)
  try {
    console.log("[Receipt System] Deleting pending receipt document: " + receiptId)
    await deleteDoc(doc(db, "pendingReceipts", receiptId))
    console.log("[Receipt System] Pending receipt deleted.")
  } catch (error) {
    console.error("[Receipt System] Error during receipt rejection: ", error)
    throw error
  }
}
