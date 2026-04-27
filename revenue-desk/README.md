# Revenue Desk

A modern business management SaaS for local service businesses. Track leads, manage customers, and grow your business.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-cyan)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)

## Features

- **Multi-tenant Architecture** - Each business gets isolated data
- **Lead Management** - Track potential customers through the sales pipeline
- **Customer Management** - Manage your paying customer base
- **Real-time Dashboard** - Business metrics at a glance
- **Secure Authentication** - JWT-based auth with NextAuth.js
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Backend | Next.js API Routes |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma |
| Auth | NextAuth.js |

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
npx prisma migrate dev

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### First Steps

1. Navigate to `/auth/signup`
2. Create your account with your business name
3. Start adding leads and customers

## Project Structure

```
revenue-desk/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Protected routes
│   │   │   ├── leads/          # Lead management
│   │   │   └── customers/      # Customer management
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication
│   │   │   ├── leads/          # Lead CRUD
│   │   │   ├── customers/      # Customer CRUD
│   │   │   └── dashboard/      # Dashboard stats
│   │   └── auth/               # Public auth pages
│   ├── components/             # React components
│   ├── lib/                    # Utilities
│   │   ├── prisma.ts          # Database client
│   │   └── auth.ts            # Auth configuration
│   └── types/                  # TypeScript definitions
├── prisma/
│   └── schema.prisma          # Database schema
└── public/                     # Static assets
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
  └── Workspace (1:N) ─── Lead
  │
  └── Workspace (1:N) ─── Customer
```

### Update Database

```bash
# Create migration
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
| `/api/dashboard/stats` | GET | Dashboard statistics |

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key-here"
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Manual

```bash
npm run build
npm run start
```

## Learning Resources

- [TypeScript Handbook](./TS-CHECKLIST.md)
- [Software Engineering Guide](./SOFTWARE-ENGINEERING.md)
- [Feature Roadmap](./FEATURES.md)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use for personal or commercial projects.

---

Built with learning in mind. Every line of code is an opportunity to grow.