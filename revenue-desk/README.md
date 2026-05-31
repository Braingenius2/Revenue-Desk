# Revenue Desk

A modern business management dashboard for local service businesses in Lagos. Track jobs, leads, customers, and revenue — all from your phone.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![PWA](https://img.shields.io/badge/PWA-ready-purple)

## Features

- **Job / Order Management** — Track repair jobs from start to finish. Vehicle info, labour/parts pricing in ₦, status pipeline (Pending → In Progress → Completed → Paid → Delivered).
- **Lead Management** — Track potential customers through the sales pipeline.
- **Customer Management** — Manage your paying customer base with total spend history.
- **Real-time Dashboard** — Business metrics at a glance (active jobs, leads, customers).
- **PWA Support** — Install as an app on your phone. Works offline with service worker caching.
- **Naira (₦) Pricing** — All amounts displayed in Nigerian Naira.
- **CSV Export** — One-click export of customers and jobs to CSV.
- **Multi-tenant Architecture** — Each business gets isolated data via workspaces.
- **Secure Authentication** — JWT-based auth with NextAuth.js (email/password).
- **Role-based Access** — USER and ADMIN roles for business owner control.
- **Mobile-first Responsive** — Card layout on phones, table view on desktop.
- **Dark Mode** — Built-in dark/light theme toggle.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Backend | Next.js API Routes |
| Database | SQLite (dev) / Turso or PostgreSQL (prod) |
| ORM | Prisma |
| Auth | NextAuth.js (Credentials + JWT) |
| PWA | Service Worker + Web Manifest |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd revenue-desk

# Install dependencies
npm install

# Set up the database
npx prisma db push

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### First Steps

1. Navigate to `/auth/signup`
2. Create your account with your business name
3. Add your first customer
4. Create a job/order for that customer
5. Track job status as work progresses

## Project Structure

```
revenue-desk/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (dashboard)/         # Protected routes
│   │   │   ├── admin/           # Admin panel
│   │   │   ├── customers/       # Customer management
│   │   │   ├── jobs/            # Job/Order management
│   │   │   └── leads/           # Lead management
│   │   ├── api/                 # API routes
│   │   │   ├── auth/            # Authentication (NextAuth)
│   │   │   ├── customers/       # Customer CRUD
│   │   │   ├── dashboard/       # Dashboard statistics
│   │   │   ├── jobs/            # Job CRUD
│   │   │   └── leads/           # Lead CRUD
│   │   └── auth/                # Public auth pages
│   ├── components/              # React components
│   │   ├── Dashboard/           # Dashboard widgets
│   │   ├── Header/              # App header
│   │   ├── Layouts/             # Page layouts
│   │   ├── Sidebar/             # Navigation sidebar
│   │   └── PwaRegister.tsx      # Service worker registration
│   ├── lib/                     # Utilities
│   │   ├── prisma.ts           # Database client
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── currency.ts         # Naira (₦) formatting
│   │   ├── export.ts           # CSV export utility
│   │   ├── roles.ts            # Role definitions
│   │   ├── roleUtils.ts        # Role helpers
│   │   └── utils.ts            # General utilities
│   ├── middleware.ts            # Route protection
│   └── types/                   # TypeScript definitions
├── prisma/
│   └── schema.prisma           # Database schema
└── public/
    ├── manifest.json            # PWA manifest
    ├── sw.js                    # Service worker
    └── images/                  # Static assets
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Database

### Schema Overview

```
User ──── Workspace (1:1)
  │
  ├── Workspace (1:N) ─── Lead
  ├── Workspace (1:N) ─── Customer ─── Job (1:N)
  │
  └── Account / Session (NextAuth)
```

### Job Status Workflow

```
PENDING → IN_PROGRESS → COMPLETED → PAID → DELIVERED
                                              ↓
                                         CANCELLED (can drop from any state)
```

### Update Database

```bash
# Push schema changes (dev)
npx prisma db push

# Create migration (prod)
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database
npx prisma reset
```

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handlers |
| `/api/auth/register` | POST | Create new account |
| `/api/leads` | GET, POST | List/Create leads |
| `/api/leads/[id]` | GET, PUT, DELETE | Lead operations |
| `/api/customers` | GET, POST | List/Create customers |
| `/api/customers/[id]` | GET, PUT, DELETE | Customer operations |
| `/api/jobs` | GET, POST | List/Create jobs |
| `/api/jobs/[id]` | GET, PUT, DELETE | Job operations |
| `/api/dashboard/stats` | GET | Dashboard statistics |
| `/api/admin/users` | GET | List users (admin only) |

## Environment Variables

Create a `.env` file in the `revenue-desk/` directory:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key-here"
```

Generate a secure secret with: `openssl rand -base64 32`

## Deployment

### Vercel (Recommended — Free tier works)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set `DATABASE_URL` to a hosted SQLite (Turso) or PostgreSQL
4. Set `AUTH_SECRET`
5. Deploy

### Manual

```bash
npm run build
npm run start
```

## PWA Usage

1. Open the app in Chrome or Safari on your phone
2. You'll see an "Add to Home Screen" prompt (or use the browser menu)
3. The app launches in full-screen mode without browser chrome
4. Basic offline support via service worker caching

## Learning Resources

- [TypeScript Handbook](./TS-CHECKLIST.md)
- [Software Engineering Guide](./SOFTWARE-ENGINEERING.md)
- [Feature Roadmap](./FEATURES.md)

## License

MIT License — free for personal or commercial use.
