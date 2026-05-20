# Changelog

## 2025-10-30 — Firebase Removal & localStorage Migration

### Overview
Completely removed Firebase authentication and Firestore database. Replaced with localStorage-based authentication and data persistence. App now runs entirely offline without any external dependencies.

### What changed
- **Authentication (localStorage)**
  - Replaced Firebase Auth with localStorage-based auth service
  - Default admin account: `admin@ctrlfund.com` / `admin123`
  - User data stored in localStorage key: `ctrlfund_users`
  - Current user session stored in: `ctrlfund_current_user`
  - All auth functions maintained same API: login, signup, logout, user management

- **Transactions (localStorage)**
  - Replaced Firestore queries with localStorage
  - Transactions stored in localStorage key: `ctrlfund_transactions`
  - Removed real-time listeners, replaced with manual state management
  - All CRUD operations (add, update, delete) work with localStorage

- **Files Removed**
  - `lib/firebaseConfig.ts` (Firebase configuration)
  - `FIREBASE_SETUP.md` (Firebase setup instructions)
  - `firestore.rules` (Firestore security rules)

- **Dependencies Removed**
  - Uninstalled `firebase` package (83 packages removed)
  - Removed all Firebase imports from codebase

- **Files Modified**
  - `services/authService.ts`: Complete rewrite using localStorage
  - `contexts/auth-context.tsx`: Removed Firebase auth listener, load user from localStorage
  - `context/transaction-context.tsx`: Replaced Firestore queries with localStorage
  
### Login Credentials
- **Admin Account**
  - Email: `admin@ctrlfund.com`
  - Password: `admin123`
  - Role: admin (full permissions)
  - Status: active

### Technical Details
- **Storage Keys**
  - Users: `ctrlfund_users`
  - Current User: `ctrlfund_current_user`
  - Transactions: `ctrlfund_transactions`

- **Default Admin User**
  ```json
  {
    "id": "default-admin",
    "email": "admin@ctrlfund.com",
    "password": "admin123",
    "name": "Main Admin",
    "role": "admin",
    "isActive": true
  }
  ```

### Notes
- Google Sign-In disabled (shows error message in offline mode)
- All data persists in browser localStorage
- Clear localStorage to reset all data
- Password stored in plain text (demo only - not production ready)

### Verify locally
```bash
npm run dev
# Navigate to http://localhost:3000/login
# Login with: admin@ctrlfund.com / admin123
```

---

## 2025-10-29 — Cleanup and route consolidation (branch: `deonscommit`)

### Overview
Workspace cleaned and routes consolidated to reduce page count and simplify structure. Duplicate CSS removed; build artifacts purged. Navigation reflects the new, minimal route set.

### What changed
- Routes removed (merged elsewhere)
  - Deleted: `app/admin/`, `app/archive/`, `app/receipts/`, `app/notes/[id]/`
- Routes consolidated
  - Receipts moved into the Transactions page as a tab controlled by `?tab=receipts`
  - Notes detail handled inline on `/notes` via `?id=NOTE_ID` (no more dynamic `[id]` segment)
  - Archived view handled on the Dashboard via `?view=archived` (no separate `/archive` route)
- Navigation
  - Now only shows: Dashboard (`/dashboard`), Transactions (`/transactions`), Notes (`/notes`)
  - Links to `/receipts`, `/archive`, `/admin` removed
- CSS & assets
  - Removed duplicate `styles/globals.css`; canonical global styles live in `app/globals.css`
  - Deleted empty `styles/` directory
  - All images/static assets remain under `public/`
- Build artifacts
  - Purged `.next/` locally (already ignored via `.gitignore`)

### Affected paths
- Removed directories
  - `app/admin/`
  - `app/archive/`
  - `app/receipts/`
  - `app/notes/[id]/`
  - `styles/` (empty after removing duplicate stylesheet)
- Removed files
  - `styles/globals.css`
- Kept (canonical)
  - `app/globals.css`

### Notes
- Source code audit found no remaining references to `/receipts`, `/archive`, `/admin`, or `/notes/[id]`.
- `firestore.rules` still includes collections like `receipts` and `archive`; rules were intentionally left unchanged since data access patterns may still rely on these collections.

### Verify locally (optional)
- Dev: `next dev`
- Lint: `next lint`
- Build: `next build`

### Follow-ups (optional)
- Add a receipts table/gallery to the Transactions “Receipts” tab to reach full parity with the old page.
- If you want even stricter separation, we can migrate page-specific styles into co-located CSS modules and keep `app/globals.css` only for base tokens/utilities.
