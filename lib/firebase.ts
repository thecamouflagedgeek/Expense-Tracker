import { initializeApp, getApps } from "firebase/app"
import { browserLocalPersistence, getAuth, setPersistence } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const requiredEnv = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const missingEnv = Object.entries(requiredEnv)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missingEnv.length > 0) {
  throw new Error(`Missing Firebase environment values: ${missingEnv.join(", ")}`)
}

const firebaseConfig = {
  apiKey: requiredEnv.apiKey,
  authDomain: requiredEnv.authDomain,
  projectId: requiredEnv.projectId,
  storageBucket: requiredEnv.storageBucket,
  messagingSenderId: requiredEnv.messagingSenderId,
  appId: requiredEnv.appId,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

const auth = getAuth(app)
if (typeof window !== "undefined") {
  void setPersistence(auth, browserLocalPersistence)
}
const db = getFirestore(app)

export { auth, db }
export default app
