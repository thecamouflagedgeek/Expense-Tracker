// Firebase configuration and initialization
// This prepares the app for Firebase integration while keeping localStorage functional

import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getFirestore, initializeFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

// Firebase configuration from environment variables
const rawStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ""
const sanitizedStorageBucket = rawStorageBucket.replace(".firebasestorage.app", ".appspot.com").trim()

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: sanitizedStorageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const

// Validate env. If any missing, throw a clear error in dev.
const missing = Object.entries(firebaseConfig).filter(([_, v]) => !v)
if (missing.length) {
  throw new Error(
    `Missing Firebase env vars: ${missing.map(([k]) => k).join(", ")}. Check .env.local and restart dev server.`
  )
}

// Debug: Log configuration (remove in production)
console.log("Firebase Config:", {
  apiKey: firebaseConfig.apiKey ? "✅ Set" : "❌ Missing",
  authDomain: firebaseConfig.authDomain ? "✅ Set" : "❌ Missing",
  projectId: firebaseConfig.projectId ? "✅ Set" : "❌ Missing",
  storageBucket: firebaseConfig.storageBucket ? "✅ Set" : "❌ Missing",
  messagingSenderId: firebaseConfig.messagingSenderId ? "✅ Set" : "❌ Missing",
  appId: firebaseConfig.appId ? "✅ Set" : "❌ Missing",
})

// Initialize Firebase (only if not already initialized)
let app: FirebaseApp
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Firebase services
export const auth: Auth = getAuth(app)
// Ensure persistence only in browser
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch(() => {})
}

// Initialize Firestore with improved network compatibility (fixes "client is offline" in some envs)
let dbInstance: Firestore
try {
  dbInstance = initializeFirestore(app, { experimentalAutoDetectLongPolling: true })
} catch {
  dbInstance = getFirestore(app)
}
export const db: Firestore = dbInstance
export const storage: FirebaseStorage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: "select_account" })

export default app
