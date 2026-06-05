import { db, storage } from "@/lib/firebase"
import { doc, getDoc, setDoc, Timestamp, collection, addDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { UploadLink } from "./types"

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
