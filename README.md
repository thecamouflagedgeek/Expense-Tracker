# Expense Tracker

Expense Tracker is a modern personal finance management web application designed to help individuals monitor, analyze, and optimize their financial habits. Built using Next.js (App Router), React, and Tailwind CSS on the frontend, and backed by Google Firebase services, it provides a highly responsive, secure, and real-time environment for financial tracking.

The application allows users to manage their transactional history, document critical financial decisions, export summaries to standardized formats (PDF, Excel), and configure local preferences securely.

---

## Key Features

### Authentication
* **Secure Client Session Management:** Email and password credentials flow powered by Firebase Authentication.
* **Persistent Sessions:** Persistent login states leveraging Firebase Client SDK local persistence.
* **Route Protection:** Dedicated middleware-style React hooks and components restricting unauthorized guest access to dashboard resources.

### Dashboard & Analytics
* **Dynamic Visualization:** Interactive spending patterns and categorical breakdowns generated with lightweight chart engines.
* **Real-time Metrics:** High-level dynamic summary cards displaying net income, current monthly expenses, and total savings.
* **Activity Tracking:** Feed of recent activity displaying a clean timeline of transaction history.

### Transaction Management
* **Single & Bulk Entry:** Streamlined interfaces to register standalone transactions or import bulk transactions via interactive UI forms.
* **Granular Categorization:** Assignment of custom tags, transaction types (income/expense), and accounts.
* **Soft Archiving:** Capability to archive or soft-delete transaction data, preventing data loss while keeping dashboards clean.

### Notes Management
* **Interactive Notebook:** In-context notes utility allowing users to document financial strategies, budgets, or payment reminders.
* **Metadata & Tags:** Grouping and search functionality inside notes to sync personal logs with financial events.

### Receipt Management
* **Receipt Upload Utility:** Dedicated portal to upload digital invoice documents or receipts.
* **Metadata Association:** Direct linking of uploaded receipt assets to specific transaction line items.
* **Drive Synchronization:** Integrates a backup flow facilitating file transfers to external storage.

### Currency & Localization
* **Dynamic Currency Context:** Multi-currency provider supporting seamless real-time swaps across major global currencies (e.g., USD, EUR, GBP, INR).
* **Localized Formatting:** Localized number parsers ensuring that decimals and currency symbols are accurately rendered dynamically.

### Export & Reporting
* **Excel Tabulations:** Exports granular transactional logs to standardized `.xlsx` tables using sheet utilities (`XLSX`).
* **PDF Financial Reports:** Direct generation of professional monthly audit sheets and expense invoices via `jsPDF`.

### Permissions & Access Control
* **Role-Based Authorization:** Contextual permission model defined under a custom `RoleContext`.
* **Account Verification Guards:** Dynamic checks evaluating user status and enforcing access policies (e.g., `isActive` checks).

### Financial Education
* **Educational Modules:** An integrated learning repository compiling essential personal finance strategies, budgeting guides, and compounding tutorials.

### User Preferences
* **Tailored Personalization:** Real-time theme provider supporting smooth Dark Mode and Light Mode switching.
* **State Persistence:** Preserves active currencies, theme configurations, and custom layout configurations across browser sessions.

---

## Architecture

![Transaction Management Flow Diagram](./Transaction%20Management-2026-05-30-184950.svg)

> [!NOTE]
> The diagram above models the transaction lifecycles, showing state flows between the UI components, React Context, and the real-time Firebase datastore.

The application architecture utilizes a decoupled serverless framework:
* **Next.js Frontend:** Leverage App Router architecture for optimized layouts and client-side page rendering.
* **Context-Based State Management:** Multi-layered React Context providers handling authentication state, transaction operations, active currencies, and notification buses.
* **Firebase Authentication:** Handles identity verification and generates secure JSON Web Tokens (JWT) for secure session tracking.
* **Firestore Real-time Synchronization:** Real-time listeners on Firestore collections push instant updates to the frontend upon any database edits.
* **Local Storage Persistence:** Safeguards UI settings (e.g., theme toggle, selected currency) locally to ensure a consistent experience across sessions.

---

## Project Structure

```text
Expense-Tracker/
├── app/                  # Next.js App Router folders (pages, layouts, API routers)
│   ├── admin/            # Administrative dashboard and privilege controls
│   ├── api/              # Internal API endpoints and webhook integrations
│   ├── dashboard/        # Main analytical view and transactional panels
│   ├── financial-education/ # Financial education resource directories
│   ├── login/            # Authentication view and portal pages
│   ├── notes/            # User notes listing and editor panels
│   ├── transactions/     # Granular transaction records and search tables
│   ├── globals.css       # Core tailwind directives and style tokens
│   ├── layout.tsx        # Top-level HTML template and viewport configuration
│   └── providers.tsx     # Unified wrapper for context provider trees
├── components/           # Reusable UI elements and complex visual modules
│   ├── ui/               # Core atomic primitives (buttons, inputs, dialogs)
│   └── *.tsx             # Chart cards, modal dialogs, navigation layout bars
├── context/              # Modular context domains (currency, transactions)
├── contexts/             # Core context domains (authentication, permissions, notifications)
├── hooks/                # Custom React hook utilities (notes, responsive states)
├── lib/                  # Library configurations (Firebase SDK and style utilities)
└── utils/                # Helper utilities (currency formatting, file export generators)
```

---

## Core Functionality

### Authentication Flow
When a user accesses the application, `AuthContext` interfaces with Firebase Auth to fetch active session details. The user is redirected to the `/login` route if unauthenticated. Once authorized, session parameters are generated, token state updates are tracked globally, and the `ProtectedRoute` wrapper renders dashboard routing components without full page reloads.

### Transaction Lifecycle
1. **Creation:** A user submits details via the `AddTransactionModal` (individually) or `BulkAddModal` (en masse).
2. **Validation & Sync:** The inputs are validated on the client side, then committed to the Firebase database.
3. **Real-time Sync:** An active snapshot listener updates the in-memory context immediately.
4. **Archiving:** Records can be archived or soft-deleted, updating an `isArchived` flag inside the database record to hide them from current dashboard lists while preserving historical accuracy.

### Notes Lifecycle
Notes are initialized in the `NoteEditor` and synced in real-time with Firestore. The `useNotes` custom hook abstracts all transactions on notes—handling mutations, queries, tags updates, and deletion requests. Deleting or archiving notes instantly updates UI states using local memory states prior to Firestore confirmations, providing zero-latency interactions.

### Dashboard Analytics Flow
Upon transactional changes, aggregation engines compile historical values in the background. The raw transaction list is mapped to active visual structures containing expense distributions and monthly income sums. These structured datasets feed directly into the responsive layout charts (`category-chart`, `transaction-chart`), providing near-instant layout updates.

---

## Technology Decisions

* **Next.js:** Implemented to benefit from modern App Router architectures and standard routing defaults. Next.js streamlines layouts organization and optimizes code compilation.
* **Firebase:** Used to serve as a fast serverless foundation, handling authentication routines, backend APIs, and hosting pipelines securely without separate container configurations.
* **Firestore:** Selected for its real-time document synchronization capabilities. Document subscriptions remove complex REST state pollings, ensuring a fluid user experience.
* **React Context:** Chosen over heavier global stores (e.g., Redux) to maintain a fast, clean, and highly maintainable codebase. Standard Context APIs natively accommodate auth, state, notifications, and localized features with minimal overhead.

---

## Screenshots

### Dashboard
![Dashboard Placeholder](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.png)  
*Dynamic dashboard interface containing analytics summaries, visual charts, and current activity history.*

### Transactions
![Transactions Table Placeholder](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.png)  
*Granular transaction lookup dashboard with rich filters, category badges, and export capabilities.*

### Notes
![Notes Workspace Placeholder](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.png)  
*Integrated personal financial editor supporting tag management and quick reminders.*

---

## Installation

### Prerequisites
* **Node.js:** v18.x or higher
* **npm:** v9.x or higher
* **Firebase Account:** A project set up in the Firebase Console

### Step-by-Step Setup

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/expense-tracker.git
   cd expense-tracker
   ```

2. **Install Dependencies:**
   ```bash
   npm install or npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and append your credentials:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` inside your browser to view the application.

---

## Future Improvements

* **Cloud Receipt Storage:** Transition fully to Firebase Storage for hosting receipt PDFs and images, moving away from local cache mechanisms.
* **Advanced Budgeting Engine:** Establish strict monthly budgets per category with custom email triggers using Firebase Cloud Functions.
* **Better Reporting:** Custom calendar exports allowing users to query date ranges, build comparison matrices, and schedule PDF updates.
* **Predictive Analytics:** Integrate spending trend projections using client-side regressions to suggest optimization steps.

---

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit Your Changes:**
   ```bash
   git commit -m "feat: add some amazing feature"
   ```
4. **Push to Your Branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request** explaining your enhancements.

Please ensure your changes pass existing lint configurations (`npm run lint`) and conform to standard React/TypeScript best practices.

---

## License

Distributed under the MIT License. See [LICENSE](./LICENSE) for details.