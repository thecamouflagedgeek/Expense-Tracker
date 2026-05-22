import { NextResponse } from "next/server"

const ownerEmails = new Set(
  (process.env.CTRLFUND_OWNER_EMAILS || process.env.OWNER_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
)

async function lookupFirebaseAccount(token: string) {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  if (!apiKey) return null

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }),
    cache: "no-store",
  })

  if (!response.ok) return null

  const data = (await response.json()) as {
    users?: Array<{ email?: string; emailVerified?: boolean }>
  }
  return data.users?.[0] ?? null
}

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization") || ""
  const token = authorization.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : ""
  const account = token ? await lookupFirebaseAccount(token) : null
  const email = account?.email?.toLowerCase() || ""

  return NextResponse.json({
    owner: Boolean(email && ownerEmails.has(email)),
  })
}
