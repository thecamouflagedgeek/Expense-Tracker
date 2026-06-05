import { db, storage } from "@/lib/firebase"
import { doc, getDoc, setDoc, Timestamp, collection, addDoc, query, where, onSnapshot, updateDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { UploadLink, PendingUploader } from "./types"

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
  } catch (error) {
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
      const expiresAtMillis = getMillis(data.expiresAt)
      if (expiresAtMillis <= Date.now()) {
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

export async function uploadReceiptToFirebase(
  ownerId: string,
  linkId: string,
  file: File,
  description: string
) {
  const fileExtension = file.name.includes(".") ? file.name.substring(file.name.lastIndexOf(".")) : ""
  const generatedFileName = `${crypto.randomUUID()}${fileExtension}`
  
  let receiptUrl = ""
  let fallbackUsed = false
  let fileBase64 = ""

  try {
    const storageRef = ref(storage, `receipts/${ownerId}/${generatedFileName}`)
    const snapshot = await uploadBytes(storageRef, file)
    receiptUrl = await getDownloadURL(snapshot.ref)
  } catch (error) {
    fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    receiptUrl = fileBase64
    fallbackUsed = true
  }

  const receiptData = {
    ownerId,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    receiptUrl,
    description,
    uploadedAt: Timestamp.now(),
    uploadedViaLink: true,
    linkId,
  }

  try {
    await addDoc(collection(db, "receipts"), receiptData)
  } catch (error) {
    if (typeof window !== "undefined") {
      const localReceipt = {
        id: crypto.randomUUID(),
        userId: ownerId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        description,
        uploadedAt: new Date().toISOString(),
        fileData: fileBase64 || await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }
      const existing = JSON.parse(localStorage.getItem("ctrlfund_receipts") || "[]")
      localStorage.setItem("ctrlfund_receipts", JSON.stringify([...existing, localReceipt]))
      window.dispatchEvent(new Event("receipts-updated"))
    }
  }

  return { success: true, fallbackUsed }
}

function getLocalUploaders(): Record<string, any> {
  if (typeof window === "undefined") return {}
  const data = localStorage.getItem("ctrlfund_pending_uploaders")
  return data ? JSON.parse(data) : {}
}

export async function requestUploaderAccess(linkId: string, ownerId: string, name: string) {
  const uploaderId = crypto.randomUUID()
  const uploaderData: PendingUploader = {
    id: uploaderId,
    linkId,
    ownerId,
    name,
    status: "pending",
    createdAt: Timestamp.now(),
  }
  try {
    await setDoc(doc(db, "pendingUploaders", uploaderId), uploaderData)
  } catch (error) {
    if (typeof window !== "undefined") {
      const local = getLocalUploaders()
      local[uploaderId] = {
        ...uploaderData,
        createdAt: uploaderData.createdAt.toMillis()
      }
      localStorage.setItem("ctrlfund_pending_uploaders", JSON.stringify(local))
      window.dispatchEvent(new Event("pending-uploaders-updated"))
    }
  }
  return uploaderId
}

export function subscribePendingUploaders(ownerId: string, callback: (uploaders: PendingUploader[]) => void) {
  let unsubscribed = false
  let firestoreUnsubscribe: (() => void) | null = null
  const checkLocal = () => {
    const local = getLocalUploaders()
    const filtered = Object.values(local).filter(
      (u: any) => u.ownerId === ownerId && u.status === "pending"
    )
    callback(filtered.map((u: any) => ({
      ...u,
      createdAt: Timestamp.fromMillis(u.createdAt)
    })) as PendingUploader[])
  }
  try {
    const q = query(
      collection(db, "pendingUploaders"),
      where("ownerId", "==", ownerId),
      where("status", "==", "pending")
    )
    firestoreUnsubscribe = onSnapshot(q, (snapshot) => {
      const uploaders: PendingUploader[] = []
      snapshot.forEach((doc) => {
        uploaders.push(doc.data() as PendingUploader)
      })
      callback(uploaders)
    }, (err) => {
      if (!unsubscribed) {
        checkLocal()
        window.addEventListener("pending-uploaders-updated", checkLocal)
      }
    })
  } catch (error) {
    checkLocal()
    window.addEventListener("pending-uploaders-updated", checkLocal)
  }
  return () => {
    unsubscribed = true
    if (firestoreUnsubscribe) firestoreUnsubscribe()
    if (typeof window !== "undefined") {
      window.removeEventListener("pending-uploaders-updated", checkLocal)
    }
  }
}

export async function respondToUploaderAccess(uploaderId: string, approve: boolean) {
  const status = approve ? "approved" : "rejected"
  try {
    await updateDoc(doc(db, "pendingUploaders", uploaderId), { status })
  } catch (error) {
    const local = getLocalUploaders()
    if (local[uploaderId]) {
      local[uploaderId].status = status
      localStorage.setItem("ctrlfund_pending_uploaders", JSON.stringify(local))
      window.dispatchEvent(new Event("pending-uploaders-updated"))
    }
  }
}

export function subscribeUploaderStatus(uploaderId: string, callback: (uploader: PendingUploader | null) => void) {
  let unsubscribed = false
  let firestoreUnsubscribe: (() => void) | null = null
  const checkLocal = () => {
    const local = getLocalUploaders()
    const found = local[uploaderId]
    if (found) {
      callback({
        ...found,
        createdAt: Timestamp.fromMillis(found.createdAt)
      } as PendingUploader)
    } else {
      callback(null)
    }
  }
  try {
    firestoreUnsubscribe = onSnapshot(doc(db, "pendingUploaders", uploaderId), (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as PendingUploader)
      } else {
        checkLocal()
      }
    }, (err) => {
      if (!unsubscribed) {
        checkLocal()
        window.addEventListener("pending-uploaders-updated", checkLocal)
      }
    })
  } catch (error) {
    checkLocal()
    window.addEventListener("pending-uploaders-updated", checkLocal)
  }
  return () => {
    unsubscribed = true
    if (firestoreUnsubscribe) firestoreUnsubscribe()
    if (typeof window !== "undefined") {
      window.removeEventListener("pending-uploaders-updated", checkLocal)
    }
  }
}
