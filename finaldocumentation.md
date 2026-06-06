# CtrlFund — Complete Project Documentation

> **A full-stack personal finance and team expense tracker built with Next.js 15, Firebase Authentication, and Firestore.**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [Firebase Setup & Configuration](#4-firebase-setup--configuration)
5. [Environment Variables](#5-environment-variables)
6. [Architecture & Data Flow](#6-architecture--data-flow)
7. [Firestore Collections & Schema](#7-firestore-collections--schema)
8. [Authentication System](#8-authentication-system)
9. [Context Providers & State Management](#9-context-providers--state-management)
10. [Pages & Routes](#10-pages--routes)
11. [Components](#11-components)
12. [Receipt Upload System (Firestore-Only)](#12-receipt-upload-system-firestore-only)
13. [Notes System](#13-notes-system)
14. [Currency System](#14-currency-system)
15. [Transaction System](#15-transaction-system)
16. [UI Design System](#16-ui-design-system)
17. [Local Storage Usage](#17-local-storage-usage)
18. [Navigation & Layout](#18-navigation--layout)
19. [Export & PDF Utilities](#19-export--pdf-utilities)
20. [Running the Project Locally](#20-running-the-project-locally)
21. [Firestore Security Rules](#21-firestore-security-rules)
22. [Known Behaviours & Design Decisions](#22-known-behaviours--design-decisions)

---

## 1. Project Overview

**CtrlFund** is a premium, full-stack expense tracking application. It allows users to:

- Track income and expense transactions with categories.
- View summarised financial dashboards with charts.
- Create and manage markdown-style notes.
- Generate **temporary, 5-minute receipt upload links** that can be shared with anyone — no login required on the recipient's side.
- Receive, review, and **approve or reject receipt uploads** in a private moderation queue.
- Convert all currency amounts across **20 supported currencies** dynamically.
- Export transaction data to PDF/CSV.

The application is a **Firestore-only** system — it does **not** use Firebase Storage, no GCS CORS setup, no Firebase Blaze plan is required for the Storage service. Images are stored as **Base64 data URLs** directly inside Firestore documents.

---

## 2. Tech Stack & Dependencies

### Framework & Runtime

| Package | Version | Purpose |
|---|---|---|
| `next` | `^16.2.7` | Full-stack React framework (App Router) |
| `react` | `^18.3.1` | UI library |
| `react-dom` | `^18.3.1` | DOM renderer |
| `typescript` | `^5` | Type safety |

### Firebase

| Package | Version | Purpose |
|---|---|---|
| `firebase` | `^12.0.0` | Auth + Firestore |

> **Note:** Firebase Storage is **NOT** used anywhere in the codebase.

### UI Components & Styling

| Package | Purpose |
|---|---|
| `tailwindcss` | Utility-first CSS framework |
| `tailwindcss-animate` | Animation utilities |
| `@radix-ui/*` | Headless, accessible UI primitives (Dialog, DropdownMenu, Select, Switch, etc.) |
| `class-variance-authority` | Component variant system |
| `clsx` + `tailwind-merge` | Class name merging utilities |
| `lucide-react` | Icon library |
| `framer-motion` | Animations and page transitions |
| `next-themes` | Light/dark theme management |
| `geist` | Geist font family |

### Data & Forms

| Package | Purpose |
|---|---|
| `react-hook-form` | Form state management |
| `@hookform/resolvers` | Form validation resolvers |
| `zod` | Schema validation |
| `date-fns` | Date utility functions |
| `react-day-picker` | Date picker component |

### Charts & Export

| Package | Purpose |
|---|---|
| `recharts` | Charts (bar, area, pie) |
| `jspdf` + `jspdf-autotable` | PDF generation |
| `xlsx` | Excel export |
| `html2canvas` | HTML to canvas for PDF export |

### Other

| Package | Purpose |
|---|---|
| `sonner` | Toast notifications |
| `react-qr-code` | QR code generation (installed but not actively shown in UI) |
| `embla-carousel-react` | Carousel/slider |
| `vaul` | Drawer component |
| `cmdk` | Command palette |
| `input-otp` | OTP input |

---

## 3. Project Structure

```
Expense-Tracker/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root HTML shell, metadata, SVG filter
│   ├── providers.tsx             # Client-side context providers wrapper
│   ├── globals.css               # Design system CSS tokens & animations
│   ├── page.tsx                  # Public landing page (unauthenticated)
│   ├── login/                    # Login/Signup page
│   ├── dashboard/                # Financial overview & charts
│   ├── transactions/             # Full transaction list & management
│   ├── notes/                    # Notes creation & management
│   ├── receipt-upload/           # Receipt upload link generator + approval queue
│   │   ├── page.tsx              # Main receipt management page (authenticated)
│   │   ├── service.ts            # All Firestore logic for receipt workflow
│   │   └── types.ts              # TypeScript types: UploadLink, PendingReceipt
│   ├── upload/
│   │   └── [linkId]/
│   │       └── page.tsx          # Public upload page (no auth required)
│   ├── shared/                   # Shared note viewing
│   └── api/                      # API routes (if any)
│
├── components/
│   ├── navigation.tsx            # Sidebar (desktop) + top bar + mobile bottom nav
│   ├── LandingPage.tsx           # Landing page hero component
│   ├── add-transaction-modal.tsx # Modal for adding new transactions
│   ├── edit-transaction-modal.tsx# Modal for editing transactions
│   ├── bulk-add-modal.tsx        # Bulk CSV import modal
│   ├── receipt-upload-modal.tsx  # Quick receipt upload from dashboard
│   ├── receipts-panel.tsx        # Side panel showing approved receipts
│   ├── category-chart.tsx        # Pie/donut chart by category
│   ├── transaction-chart.tsx     # Line/bar chart for income vs. expense
│   ├── stats-cards.tsx           # Summary stat cards (Total income, expense, etc.)
│   ├── recent-transactions.tsx   # Short transaction list for dashboard
│   ├── transaction-list.tsx      # Full paginated transaction list
│   ├── transaction-item.tsx      # Individual transaction row
│   ├── transaction-filters.tsx   # Filter controls for transactions
│   ├── notes-list.tsx            # Notes listing component
│   ├── note-editor.tsx           # Rich text note editor
│   ├── create-note-modal.tsx     # Modal for new note creation
│   ├── export-button.tsx         # Export trigger button
│   ├── export-utils.ts           # PDF/CSV generation logic
│   ├── footer.tsx                # Footer component
│   ├── protected-route.tsx       # Auth guard wrapper
│   ├── theme-provider.tsx        # next-themes wrapper
│   ├── notification-panel.tsx    # In-app notification list
│   ├── upload-drive-modal.tsx    # Drive upload modal
│   ├── upload-sponsorship-button.tsx
│   ├── dashboard-section.tsx     # Dashboard layout section
│   └── ui/                       # shadcn/ui primitives (Button, Card, Dialog, etc.)
│
├── contexts/
│   ├── auth-context.tsx          # Firebase Auth state + user profile management
│   ├── notification-context.tsx  # In-app notification queue
│   └── role-context.tsx          # Permission/role resolver
│
├── context/
│   ├── transaction-context.tsx   # Transaction CRUD + Firestore real-time sync
│   └── currency-context.tsx      # Multi-currency converter + formatter
│
├── hooks/
│   ├── use-notes.ts              # Notes CRUD hook with Firestore sync
│   ├── use-transactions.ts       # Re-export of useTransactions context hook
│   ├── use-mobile.tsx            # Mobile breakpoint detector
│   └── use-toast.ts              # Toast notification helper
│
├── lib/
│   ├── firebase.ts               # Firebase app init, Auth, Firestore exports
│   └── utils.ts                  # cn() class utility
│
├── utils/                        # Misc utility helpers
├── public/                       # Static assets (logo, icons)
├── .env                          # Environment variables (gitignored)
├── next.config.mjs               # Next.js config
├── tailwind.config.ts            # Tailwind theme config
├── tsconfig.json                 # TypeScript config
└── package.json
```

---

## 4. Firebase Setup & Configuration

CtrlFund uses **two** Firebase services:

| Service | Used For |
|---|---|
| **Firebase Authentication** | Email/password signup, Google OAuth, session persistence |
| **Cloud Firestore** | All data: transactions, notes, users, upload links, pending receipts, receipts |

> ⚠️ **Firebase Storage is NOT used.** Receipt images are stored as Base64 strings in Firestore documents.

### Steps to Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication** → Sign-in methods → Enable **Email/Password** and **Google**.
3. Enable **Firestore Database** → Start in **production mode**.
4. Go to **Project Settings → General → Your apps → Web** → Register a new web app.
5. Copy the Firebase config values into your `.env` file (see [Section 5](#5-environment-variables)).
6. Apply the Firestore Security Rules from [Section 21](#21-firestore-security-rules).

---

## 5. Environment Variables

Create a file named `.env` in the root of the project with these values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

> `NEXT_PUBLIC_` prefix is required for Next.js to expose these to the browser.
> `storageBucket` is included in the config object but Firebase Storage is **never initialized**.

### Validation on Startup

`lib/firebase.ts` validates all env variables at app startup and throws a descriptive error if any are missing:

```ts
if (missingEnv.length > 0) {
  throw new Error(`Missing Firebase environment values: ${missingEnv.join(", ")}`)
}
```

---

## 6. Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         NEXT.JS APP ROUTER                      │
│                                                                  │
│  app/layout.tsx ──→ ClientProviders (app/providers.tsx)         │
│                         │                                        │
│      ThemeProvider ─────┘                                        │
│      NotificationProvider                                        │
│      AuthProvider ──────→ Firebase Auth (onAuthStateChanged)    │
│      RoleProvider ──────→ Derives permissions from user role    │
│      CurrencyProvider ──→ localStorage + conversion math        │
│      TransactionProvider→ Firestore real-time (onSnapshot)      │
│                                                                  │
│  Pages consume contexts via hooks:                               │
│   useAuth(), useTransactions(), useCurrency(),                   │
│   useNotes(), useRole(), useNotification()                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      RECEIPT UPLOAD SYSTEM                       │
│                                                                  │
│  1. Owner (logged in) → generateReceiptUploadLink()             │
│     ├─→ Creates doc in Firestore: uploadLinks/{linkId}          │
│     ├─→ Saves to localStorage: ctrlfund_upload_links            │
│     └─→ Returns URL: /upload/{linkId}                           │
│                                                                  │
│  2. External User → visits /upload/{linkId}                     │
│     ├─→ validateUploadLink(linkId) checks Firestore             │
│     ├─→ User selects file or takes photo                        │
│     ├─→ Client-side image compression (canvas)                  │
│     ├─→ fileToBase64(file) converts to data URL string          │
│     └─→ Saves to Firestore: pendingReceipts/{receiptId}         │
│                                                                  │
│  3. Owner → receipt-upload page (logged in)                     │
│     ├─→ subscribePendingReceipts() listens to Firestore         │
│     ├─→ Sees list of pending receipt cards                      │
│     ├─→ APPROVE → copies to receipts collection, deletes from   │
│     │            pendingReceipts, syncs localStorage             │
│     └─→ REJECT  → deletes doc from pendingReceipts              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Firestore Collections & Schema

### `users/{userId}`

Automatically created on first login (email/password or Google OAuth).

```ts
{
  id: string                  // Firebase Auth UID
  email: string
  name: string
  role: "member"
  isActive: boolean
  createdAt: string           // ISO date
  lastLogin: string | null    // ISO date
  customPermissions: {
    canEditTransactions: boolean
    canUploadReceipts: boolean
    canEditNotes: boolean
  }
  preferences: {
    spendingLimit: number        // Default: 300000 (INR)
    quickTransferCategories: string[]
  }
}
```

---

### `transactions/{transactionId}`

```ts
{
  title: string
  amount: number              // Negative for expenses, positive for income
  type: "income" | "expense"
  category: string
  date: string                // ISO date string
  description?: string
  userId: string              // Firebase Auth UID (owner)
  isArchived: boolean
  createdAt: string           // ISO date
  updatedAt: string           // ISO date
}
```

**Notes on Amount Normalization:**
- Income is stored as a **positive** number.
- Expenses are stored as a **negative** number.
- The `normalizeAmountByType()` function enforces this convention consistently.

---

### `notes/{noteId}`

```ts
{
  title: string
  content: string             // Markdown or plain text
  userId: string
  isArchived: boolean
  createdAt: string           // ISO date
  updatedAt: string           // ISO date
}
```

---

### `uploadLinks/{linkId}`

Created by the owner to generate a shareable receipt upload URL.

```ts
{
  ownerId: string             // Firebase Auth UID of the creator
  linkId: string              // UUID (also used as the Firestore document ID)
  status: "active"            // Only value used currently
  createdAt: Timestamp        // Firestore Timestamp
  expiresAt: Timestamp        // createdAt + 5 minutes
}
```

---

### `pendingReceipts/{receiptId}`

Created by the **external user** after they upload a file via the shared link.

```ts
{
  id: string                  // UUID (matches the Firestore document ID)
  ownerId: string             // UID of the owner who generated the link
  linkId: string              // The linkId from the upload URL
  fileName: string
  fileType: string            // MIME type e.g. "image/jpeg"
  fileSize: number            // File size in bytes (after compression)
  imageData: string           // Base64 data URL string (e.g. "data:image/jpeg;base64,...")
  description: string         // Optional description from the uploader
  uploadedAt: Timestamp       // Firestore Timestamp
  status: "pending"           // Always "pending" while in this collection
}
```

---

### `receipts/{receiptId}`

Created by the owner when they **approve** a pending receipt. Auto-generated ID by Firestore `addDoc`.

```ts
{
  ownerId: string
  fileName: string
  fileType: string
  fileSize: number
  imageData: string           // Base64 data URL (copied from pendingReceipts)
  description: string
  uploadedAt: Timestamp
  uploadedViaLink: true       // Always true for receipts approved from the queue
  linkId: string              // The original linkId
}
```

---

## 8. Authentication System

**File:** `contexts/auth-context.tsx`

### How It Works

Firebase Auth is the identity backbone. On every page load, `onAuthStateChanged` fires and:

1. Checks if a Firebase user is signed in.
2. Reads the corresponding Firestore `users/{uid}` document.
3. If the document doesn't exist (first login), creates it with default permissions and preferences.
4. Updates `lastLogin` on every login.
5. Sets the `user` and `userData` states in context.

### Auth Methods Supported

| Method | Function | Description |
|---|---|---|
| Email/Password | `login(email, password)` | Standard email auth |
| Google OAuth | `loginWithGoogle()` | Opens Google sign-in popup |
| Email/Password Signup | `signup(email, password, name)` | Creates user + Firestore profile |
| Logout | `logout()` | Signs out, clears context state |

### Session Persistence

```ts
setPersistence(auth, browserLocalPersistence)
```

Sessions are persisted in the browser's `localStorage`. Users stay logged in across browser restarts.

### User Model

```ts
type User = {
  id: string
  email: string
  name: string
  role: "member"
  isActive: boolean
  createdAt: string
  lastLogin: string | null
  customPermissions: {
    canEditTransactions: boolean
    canUploadReceipts: boolean
    canEditNotes: boolean
  }
  preferences: {
    spendingLimit: number
    quickTransferCategories?: string[]
  }
}
```

### Protected Routes

`components/protected-route.tsx` wraps all authenticated pages. If the user is not logged in and tries to access a protected route, they are redirected to the login page.

---

## 9. Context Providers & State Management

All providers are composed in `app/providers.tsx` as `ClientProviders`. They wrap the entire app and are rendered **client-side** only.

### Provider Stack (inside-out order)

```
ThemeProvider
  NotificationProvider
    AuthProvider
      RoleProvider
        CurrencyProvider
          TransactionProvider
            [ Page Children ]
            Toaster
```

### AuthProvider (`contexts/auth-context.tsx`)
- Manages Firebase Auth state.
- Reads/writes Firestore user profile.
- Exposes: `user`, `userData`, `loading`, `error`, `login`, `loginWithGoogle`, `signup`, `logout`, `updatePersonalSettings`.

### NotificationProvider (`contexts/notification-context.tsx`)
- Maintains a queue of in-app notifications.
- Exposes: `addNotification(message, type)`.
- Types: `"success"`, `"error"`, `"info"`.

### RoleProvider (`contexts/role-context.tsx`)
- Derives the current user's access permissions from `user.customPermissions`.
- Exposes: `permissions` object (`canViewDashboard`, `canViewTransactions`, `canViewNotes`, etc.).

### TransactionProvider (`context/transaction-context.tsx`)
- Firestore real-time listener via `onSnapshot` on the `transactions` collection.
- Filters by `userId == user.id`.
- Sorts by date descending.
- Normalizes amounts: income (+), expense (−).
- Exposes: `transactions`, `categories`, `loading`, `error`, `addTransaction`, `updateTransaction`, `deleteTransaction`, `renameCategory`.

### CurrencyProvider (`context/currency-context.tsx`)
- Stores selected currency in `localStorage` key `ctrlfund_selected_currency`.
- Default currency: **INR**.
- 20 currencies supported with static exchange rates (base: INR).
- Exposes: `currency`, `setCurrency`, `convert(inrAmount)`, `convertToINR(amount)`, `format(inrAmount)`, `symbol`.

---

## 10. Pages & Routes

### `/` — Landing Page (Public)

**File:** `app/page.tsx`

- Fully public, unauthenticated.
- Premium hero section with animated gradient and grid background.
- Feature highlights: Wallet / Smart Analytics / Secure Storage / Receipt Sharing.
- CTAs: **Sign Up** / **Sign In** buttons.
- Animated scrolling marquee of integrations/logos.

---

### `/login` — Login & Signup (Public)

**File:** `app/login/page.tsx`

- Tabbed interface: **Login** and **Sign Up**.
- Email/password form.
- Google OAuth button.
- Redirects to `/dashboard` on success.

---

### `/dashboard` — Financial Overview (Protected)

**File:** `app/dashboard/page.tsx`

- Summary stat cards: Total Income, Total Expense, Net Balance, Transactions count.
- Area/Line chart showing income vs. expense over time.
- Category donut/pie chart.
- Recent transactions list (last 5–10).
- Quick receipt panel (approved receipts sidebar).

---

### `/transactions` — Finance Hub (Protected)

**File:** `app/transactions/page.tsx`

- Full paginated list of all transactions.
- Filter by category, date range, type (income/expense).
- Add transaction button → `AddTransactionModal`.
- Edit transaction → `EditTransactionModal`.
- Delete confirmation.
- Bulk CSV import → `BulkAddModal`.
- Export to PDF/CSV buttons.

---

### `/notes` — Notes Manager (Protected)

**File:** `app/notes/page.tsx`

- Create, read, update, and delete notes.
- Archive/restore notes.
- PDF export per note.
- Real-time Firestore sync via `useNotes()` hook.

---

### `/receipt-upload` — Receipt Sharing Generator (Protected)

**File:** `app/receipt-upload/page.tsx`

- Generates a temporary 5-minute upload link for external users.
- Displays a real-time countdown timer once a link is generated.
- Copy link button.
- "How It Works" instruction card.
- Pending Approval queue: shows all receipts waiting for review.
  - Eye icon → opens preview dialog (shows image or download link for PDFs).
  - Approve → moves receipt to `receipts` collection.
  - Reject (trash) → deletes from `pendingReceipts`.
- Falls back to `localStorage` if Firestore writes fail (shows instruction banner with required Firestore rules).

---

### `/upload/[linkId]` — Public Upload Page (No Auth Required)

**File:** `app/upload/[linkId]/page.tsx`

- Dynamic route, publicly accessible — no Firebase Authentication required.
- On load: validates the `linkId` against Firestore `uploadLinks` collection.
  - If expired or invalid → shows "Link Expired or Invalid" error card.
- If valid: shows upload form with two options:
  - **Take Photo** (uses camera input with `capture="environment"` for mobile).
  - **Choose File** (standard file picker supporting `image/*` and `.pdf`).
- Selected file is shown as a preview card with name and size.
- Optional description field.
- On submit:
  1. `compressImage()` reduces image size (max 1200×1200, JPEG at 75% quality). PDFs are skipped.
  2. `uploadReceiptToFirebase()` converts to Base64 and writes to `pendingReceipts`.
  3. Success card is shown.

---

### `/shared/...` — Shared Note Viewer (Public)

**File:** `app/shared/page.tsx` (or similar)

- Allows viewing a shared note without authentication (read-only).

---

## 11. Components

### Navigation (`components/navigation.tsx`)

The navigation renders three distinct layouts depending on screen size:

| Layout | Breakpoint | Description |
|---|---|---|
| **Floating Sidebar** | Desktop (`md:flex`) | Fixed left sidebar with icon-only nav + tooltips |
| **Top Header Bar** | Desktop (`hidden md:flex`) | Fixed top bar with page title, currency picker, notification bell, export, user menu |
| **Bottom Mobile Nav** | Mobile (`md:hidden`) | Pill-style floating bottom navigation bar |

**Nav items:**
- Dashboard → `/dashboard`
- Transactions → `/transactions`
- Notes → `/notes`
- Receipt Upload → `/receipt-upload`

**Currency Dropdown:** Grouped by world region. Selecting a currency triggers `setCurrency(code)` which updates all displayed amounts app-wide.

---

### Key Modals

| Component | Purpose |
|---|---|
| `add-transaction-modal.tsx` | Form to add a new income/expense transaction |
| `edit-transaction-modal.tsx` | Form to edit an existing transaction |
| `bulk-add-modal.tsx` | CSV file import for batch transaction entry |
| `receipt-upload-modal.tsx` | Quick receipt file picker from dashboard |
| `create-note-modal.tsx` | Create a new note |

---

### Stats & Charts

| Component | Purpose |
|---|---|
| `stats-cards.tsx` | 4 summary cards (income, expense, balance, transaction count) |
| `transaction-chart.tsx` | Recharts area/bar chart: income vs expense over time |
| `category-chart.tsx` | Recharts pie/donut: spending breakdown by category |
| `recent-transactions.tsx` | Last N transactions listed on dashboard |

---

## 12. Receipt Upload System (Firestore-Only)

This is the most complex custom feature in the app. Here is the complete end-to-end breakdown.

### Types (`app/receipt-upload/types.ts`)

```ts
type UploadLink = {
  ownerId: string
  linkId: string
  status: "active"
  createdAt: Timestamp
  expiresAt: Timestamp
}

type PendingReceipt = {
  id: string
  ownerId: string
  linkId: string
  fileName: string
  fileType: string
  fileSize: number
  imageData: string     // Base64 data URL
  description: string
  uploadedAt: Timestamp
  status: "pending" | "approved" | "rejected"
}
```

---

### Service Functions (`app/receipt-upload/service.ts`)

#### `generateReceiptUploadLink(userId: string)`

- Generates a UUID as `linkId`.
- Creates a `createdAt` (now) and `expiresAt` (now + 5 min) using Firestore `Timestamp`.
- Writes the `UploadLink` document to `uploadLinks/{linkId}` in Firestore.
- Simultaneously saves to `localStorage` key `ctrlfund_upload_links` as a fallback.
- Returns: `{ linkId, uploadUrl, expiresAt, fallback }`.
  - `uploadUrl` = `${window.location.origin}/upload/${linkId}`
  - `fallback` = `true` if Firestore write failed (localStorage-only mode).

#### `validateUploadLink(linkId: string)`

- Reads `uploadLinks/{linkId}` from Firestore.
- Checks `status === "active"` and `expiresAt > now`.
- Falls back to `localStorage` if Firestore read fails.
- Returns: `{ valid: boolean, ownerId?: string, fallback?: boolean }`.

#### `fileToBase64(file: File) → Promise<string>`

- Private function using `FileReader.readAsDataURL()`.
- Returns a full Base64 data URL string including the MIME type prefix (e.g. `data:image/jpeg;base64,...`).

#### `uploadReceiptToFirebase(ownerId, linkId, file, description)`

- Calls `fileToBase64(file)` to get the image data.
- Generates a UUID as `receiptId`.
- Writes a `PendingReceipt` document to `pendingReceipts/{receiptId}` via `setDoc`.

#### `subscribePendingReceipts(ownerId, callback)`

- Real-time Firestore `onSnapshot` on `pendingReceipts` filtered by `ownerId == ownerId` AND `status == "pending"`.
- Calls `callback(receipts)` every time the collection changes.
- Returns an unsubscribe function.

#### `approvePendingReceipt(receipt: PendingReceipt)`

1. Constructs `finalReceiptData` (without `id`/`status` fields).
2. Calls `addDoc(collection(db, "receipts"), finalReceiptData)` → gets a new Firestore-generated document ID.
3. Calls `deleteDoc(doc(db, "pendingReceipts", receipt.id))` to remove from pending queue.
4. Syncs to `localStorage` key `ctrlfund_receipts`:
   - Parses existing array.
   - Checks for duplicate by `id` before pushing.
   - Dispatches `window.dispatchEvent(new Event("receipts-updated"))` to notify other components.

#### `rejectPendingReceipt(receiptId: string)`

- Simply calls `deleteDoc(doc(db, "pendingReceipts", receiptId))`.
- No data is moved to the `receipts` collection.

---

### Deduplication Logic

The Firestore `receipts` snapshot listener in `app/receipt-upload/page.tsx` has two-pass deduplication:

1. **ID-based:** Skip any Firestore receipt that already exists in `localStorage` by `id`.
2. **Content-based:** If two receipts share the same `(userId, fileName, fileSize)`, keep only the one that came from Firestore (prefer authoritative source over localStorage).

This prevents the same receipt from appearing multiple times when both Firestore and localStorage contain copies of the same item.

---

### Client-Side Image Compression (`app/upload/[linkId]/page.tsx`)

Before uploading, the `compressImage()` function:

- Skips non-image files (PDFs are sent as-is).
- Creates a canvas element, draws the image scaled down to max 1200×1200.
- Converts the canvas to a JPEG Blob at 75% quality.
- Returns a new `File` object.

This significantly reduces the size of the Base64 string stored in Firestore.

---

## 13. Notes System

**Hook:** `hooks/use-notes.ts`

The notes system is entirely driven by a custom hook that wraps Firestore.

### Operations

| Function | Firestore Operation |
|---|---|
| `createNote(note)` | `addDoc(collection(db, "notes"), ...)` |
| `updateNote(id, fields)` | `updateDoc(doc(db, "notes", id), ...)` |
| `deleteNote(id)` | `deleteDoc(doc(db, "notes", id))` |
| `setNoteArchived(id, bool)` | `updateDoc` with `isArchived` field |

### Real-Time Sync

Uses `onSnapshot` with a query filtered by `userId == user.id`. Notes are sorted by `updatedAt` descending.

### Date Normalization

The `normalizeDate()` helper handles:
- ISO string → returned as-is.
- Firestore `Timestamp` → `.toDate().toISOString()`.
- Null/undefined → current time ISO string.

---

## 14. Currency System

**File:** `context/currency-context.tsx`

### Supported Currencies (20 total)

Grouped into three regions with static exchange rates (base: **1 INR**):

| Region | Currencies |
|---|---|
| Major Global | INR, USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY |
| Middle East & Asia-Pacific | AED, SAR, SGD, HKD, KRW, NZD |
| Regional & Noteworthy | RUB, ZAR, BRL, TRY |

### Key Functions

| Function | Description |
|---|---|
| `convert(amountInINR)` | Converts an INR value to the active currency |
| `convertToINR(amount)` | Reverse conversion: active currency → INR |
| `format(amountInINR)` | Returns a formatted string using `Intl.NumberFormat` with the correct locale and symbol |

### Persistence

Currency selection is saved to `localStorage` key `ctrlfund_selected_currency` and restored on app load.

---

## 15. Transaction System

**File:** `context/transaction-context.tsx`

### Data Flow

1. On user login, `onSnapshot` is set up on the `transactions` collection filtered by `userId`.
2. Each document is mapped and normalized (amount sign, date format).
3. State is updated reactively on any Firestore change.
4. On logout, the listener is unsubscribed and state is cleared.

### Amount Convention

All amounts in Firestore follow the convention:
- **Income** → stored as a positive number (e.g. `5000`).
- **Expense** → stored as a negative number (e.g. `-1500`).

The `normalizeAmountByType(amount, type)` helper enforces this regardless of what the user inputs (it takes the absolute value and applies the sign).

### Category Rename

`renameCategory(oldName, newName)` uses a **batch write** to update all transactions in the same category atomically.

---

## 16. UI Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Background | `#eff1e9` (beige-cream) | Page background |
| Foreground | `#0c0d0e` (near-black) | Primary text |
| Primary / Accent | `#ccff00` (electric lime) | Active states, highlights, logo |
| Card | `#ffffff` (white) | All cards and modals |
| Border | `rgba(0,0,0,0.04)` | Subtle card borders |
| Sidebar | `#0c0d0e` (near-black) | Navigation sidebar |

### Typography

- **Font:** Geist (`geist` package) applied via `font-sans` class.
- Text is `antialiased` globally.

### CSS Utility Classes (defined in `globals.css`)

| Class | Description |
|---|---|
| `.grid-bg-pattern` | 24px grid line background (beige with subtle black lines) |
| `.button-gradient` | Solid black pill button with lime glow hover effect |
| `.card-gradient` | White rounded card with soft shadow and lime border hover |
| `.stats-card` | Stats card with lift animation on hover |
| `.chart-container` | Chart wrapper with white background |
| `.glow-accent` | Lime glow border for highlights |
| `.animate-glow-pulse` | Pulsing lime glow animation (2s loop) |
| `.animate-float` | Vertical floating animation (3s loop) |
| `.animate-marquee` | Infinite horizontal scroll for logo carousel |

### Border Radius

The design uses large, premium border radius:
- CSS variable `--radius: 1.5rem` (24px) for cards.
- Buttons use `rounded-2xl` (16px) or `rounded-3xl` (24px).

### Dark Mode

The app defines a `.dark` theme that mirrors the light theme exactly (same colors). This is intentional — the design is locked to the light/cream aesthetic regardless of the system preference. Dark mode is disabled on all authenticated pages via:

```tsx
<ThemeProvider forcedTheme={isPublicPage ? undefined : "light"}>
```

---

## 17. Local Storage Usage

| Key | Type | Purpose |
|---|---|---|
| `ctrlfund_upload_links` | JSON object | Fallback cache for generated upload links |
| `ctrlfund_receipts` | JSON array | Client-side cache of approved receipts |
| `ctrlfund_selected_currency` | String | Persisted currency selection (e.g. `"USD"`) |

### Receipt Local Storage Schema

```ts
// Each item in ctrlfund_receipts
{
  id: string             // Firestore document ID
  userId: string         // ownerId
  fileName: string
  fileType: string
  fileSize: number
  description: string
  uploadedAt: string     // ISO date string
  fileData: string       // Base64 data URL (= imageData from Firestore)
}
```

### `receipts-updated` Custom Event

When `ctrlfund_receipts` changes, the app dispatches `window.dispatchEvent(new Event("receipts-updated"))`. Any component listening to this event can reactively update its UI (e.g. the receipts panel on the dashboard).

---

## 18. Navigation & Layout

### Layout Shell (`app/layout.tsx`)

- Sets HTML `lang="en"` and `suppressHydrationWarning` (required for `next-themes`).
- Includes a hidden SVG filter (`#liquidFilter`) used for visual effects.
- Loads `ClientProviders` which wraps the entire page tree.
- Sets the browser tab title: **"CtrlFund - Expense & Notes Tracker"**.

### Providers Layout Logic (`app/providers.tsx`)

```ts
const isPublicPage = pathname === "/" 
  || ["/login", "/shared/note", "/upload/"].some(path => pathname.startsWith(path))
```

- **Public pages** (`/`, `/login`, `/upload/...`, `/shared/...`): Rendered without the `<Navigation>` component. No sidebar/topbar shown. Full width.
- **Authenticated pages** (`/dashboard`, `/transactions`, `/notes`, `/receipt-upload`): Rendered with `<Navigation>` and a main content area with left padding offset for the sidebar.

### Main Content Padding

```tsx
<main className="px-4 md:pl-28 md:pr-8 pt-24 pb-24 md:pb-8">
```

- `pl-28` accounts for the 80px fixed sidebar on desktop.
- `pt-24` accounts for the 80px fixed top header.
- `pb-24` accounts for the mobile bottom nav bar.

---

## 19. Export & PDF Utilities

**File:** `components/export-utils.ts`

Provides functions to export transaction data in multiple formats:

| Function | Output Format |
|---|---|
| `exportToCSV(transactions)` | Downloads a `.csv` file |
| `exportToPDF(transactions)` | Downloads a `.pdf` using `jspdf` + `jspdf-autotable` |
| `exportToExcel(transactions)` | Downloads a `.xlsx` using `xlsx` |

Note exports also support PDF download per note using `html2canvas` to render the note content.

---

## 20. Running the Project Locally

### Prerequisites

- Node.js 18+ and npm.
- A Firebase project with Auth and Firestore enabled.

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd Expense-Tracker

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create a .env file in the root and fill in your Firebase config
# (see Section 5 above)

# 4. Start the development server
npm run dev

# 5. Open the app
# http://localhost:3000
```

### Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server with hot reload |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server (requires build first) |
| `npm run lint` | Run ESLint |

---

## 21. Firestore Security Rules

Paste these rules into the Firestore Rules editor in the Firebase Console:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users: only the owner can read/write their profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Transactions: only the owner can access their transactions
    match /transactions/{transactionId} {
      allow read, write: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }

    // Notes: only the owner can access their notes
    match /notes/{noteId} {
      allow read, write: if request.auth != null
        && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
    }

    // Upload Links: authenticated users can write; anyone can read (for link validation)
    match /uploadLinks/{linkId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Pending Receipts: anyone can create (for public upload); only auth users can read/update/delete
    match /pendingReceipts/{receiptId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }

    // Approved Receipts: only the owner can read/write
    match /receipts/{receiptId} {
      allow read, write: if request.auth != null
        && resource.data.ownerId == request.auth.uid;
      allow create: if request.auth != null
        && request.resource.data.ownerId == request.auth.uid;
    }
  }
}
```

### Rule Explanations

| Collection | Public Read | Public Write | Auth Read | Auth Write |
|---|---|---|---|---|
| `users` | ❌ | ❌ | ✅ (own doc only) | ✅ (own doc only) |
| `transactions` | ❌ | ❌ | ✅ (own docs only) | ✅ (own docs only) |
| `notes` | ❌ | ❌ | ✅ (own docs only) | ✅ (own docs only) |
| `uploadLinks` | ✅ (for validation) | ❌ | ✅ | ✅ |
| `pendingReceipts` | ❌ | ✅ (create only) | ✅ | ✅ |
| `receipts` | ❌ | ❌ | ✅ (own docs only) | ✅ (own docs only) |

---

## 22. Known Behaviours & Design Decisions

### No Firebase Storage
The entire receipt image pipeline uses **Firestore Base64 strings**. This means:
- No Blaze (pay-as-you-go) plan required for Storage.
- No CORS configuration needed.
- Images are limited by Firestore document size limit (1 MB per document). The client-side compression step (max 1200×1200 at 75% JPEG) is essential to stay within limits.

### Duplicate Prevention on Approval
When a receipt is approved, it is added to Firestore `receipts` collection with a **new Firestore-generated ID** (not the pending receipt's ID). The approval function checks localStorage for duplicates by this new ID before inserting. The Firestore snapshot listener also runs content-based deduplication by `(userId, fileName, fileSize)` to handle edge cases.

### Link Fallback Mode
If Firestore writes fail when generating an upload link (e.g. incorrect security rules), the link is saved only to `localStorage` and a warning banner is shown with the exact Firestore rules required. This is the `fallback: true` mode. In this mode, only the device that generated the link can validate it.

### `suppressHydrationWarning`
Added to the `<html>` tag to silence React hydration mismatches caused by `next-themes` toggling a `class` attribute on the server vs. client.

### TypeScript Build Errors Ignored
`next.config.mjs` includes `typescript: { ignoreBuildErrors: true }`. This allows the project to build even with TypeScript type errors, which is useful for rapid development but should be tightened in production.

### Amount Sign Convention
All monetary amounts in Firestore follow a signed convention:
- Income = positive
- Expense = negative

This simplifies sum calculations (net balance = sum of all `amount` values) but requires the `normalizeAmountByType()` call when writing any amount.

### Currency is Static (Not Live)
Exchange rates are hardcoded in `currency-context.tsx`. They do not fetch live rates from an API. For accurate real-world conversions, these rates would need to be updated periodically or replaced with an API call.

---

*Last updated: June 2026. Documentation covers the current Firestore-only implementation after the Firebase Storage migration.*
