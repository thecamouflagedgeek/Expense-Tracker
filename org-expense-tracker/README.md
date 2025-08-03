# Organization Expense Tracker

A comprehensive expense tracking and inventory management system designed for organizations, councils, and institutions.

## Features

### 🏢 Multi-Organization Support
- Role-based access control (Main Admin, College Admin, Department User, Viewer)
- Organization-specific data isolation
- Customizable permissions and workflows

### 💰 Advanced Expense Tracking
- Multiple fund sources (Personal, College, Department, Sponsorship)
- Approval workflows with status tracking
- Real-time budget monitoring and alerts
- Receipt upload and document management

### 📦 Inventory Management
- Location-based item tracking
- QR code generation for physical items
- Condition monitoring and maintenance logs
- Purchase history integration

### 📊 Analytics & Reporting
- Interactive dashboards with real-time data
- Customizable charts and graphs
- Budget utilization tracking
- Expense trend analysis

### 📄 Export & Integration
- Excel/CSV export functionality
- PDF report generation
- Google Drive integration for documents
- API-ready architecture

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Charts**: Recharts, Chart.js
- **Icons**: Lucide React
- **State Management**: React Context API

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd org-expense-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure Firebase:
   - Create a Firebase project
   - Enable Authentication, Firestore, and Storage
   - Add your Firebase config to `.env.local`

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Dashboard page
│   ├── expenses/          # Expense management
│   ├── inventory/         # Inventory management
│   ├── analytics/         # Analytics and reports
│   ├── login/            # Authentication
│   └── layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── DashboardLayout.tsx
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── charts/           # Chart components
├── contexts/             # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── lib/                  # Utility libraries
│   ├── firebase.ts
│   └── utils.ts
└── types/               # TypeScript type definitions
    └── index.ts
```

## Key Features Implementation

### Role-Based Access Control
The system supports four user roles:
- **Main Admin**: Full system access
- **College Admin**: College fund management
- **Department User**: Limited department access
- **Viewer**: Read-only access

### Fund Source Management
Expenses can be categorized by fund source:
- Personal funds
- College funds
- Department funds
- Sponsorship funds

### Approval Workflow
All expenses go through an approval process:
1. **Pending**: Awaiting approval
2. **Approved**: Ready for processing
3. **Rejected**: Denied with reason

### Inventory Tracking
Items are tracked with:
- Location details (building, room, shelf)
- Condition status
- Purchase information
- Assignment tracking

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Drive API (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment

This application can be deployed on Vercel or any platform supporting Next.js:

```bash
npm run build
vercel deploy
```

## License

This project is licensed under the MIT License.

---

Built with ❤️ for organizations worldwide.
