# Software Engineering Guide

## A Complete Walkthrough for Aspiring Junior Developers

> **Goal**: Understand the why, when, what, and how of building software - not just the syntax.

---

## Table of Contents

1. [The Development Process](#1-the-development-process)
2. [Understanding the Architecture](#2-understanding-the-architecture)
3. [Database Design](#3-database-design)
4. [API Design](#4-api-design)
5. [Authentication & Security](#5-authentication--security)
6. [Frontend Development](#6-frontend-development)
7. [Code Patterns & Best Practices](#7-code-patterns--best-practices)
8. [Common Patterns Explained](#8-common-patterns-explained)
9. [Debugging & Problem Solving](#9-debugging--problem-solving)
10. [Career Growth](#10-career-growth)

---

## 1. The Development Process

### The Full SDLC (Software Development Life Cycle)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPMENT WORKFLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   1. REQUIREMENTS            What problem are we solving?                   │
│         │                                                              │   │
│         ▼                                                              │   │
│   2. DESIGN                  How will it work?                            │
│         │  • Database schema                                              │   │
│         │  • API endpoints                                                │   │
│         │  • UI mockups                                                   │   │
│         ▼                                                              │   │
│   3. IMPLEMENTATION          Write the code                               │
│         │  • Set up project                                               │   │
│         │  • Build features                                               │   │
│         ▼                                                              │   │
│   4. TESTING                 Does it work correctly?                      │
│         │  • Manual testing                                               │   │
│         │  • Fix bugs                                                     │   │
│         ▼                                                              │   │
│   5. DEPLOYMENT              Ship to production                           │
│         │  • CI/CD pipeline                                               │   │
│         │  • Monitoring                                                   │   │
│         ▼                                                              │   │
│   6. MAINTENANCE             Keep it running                               │
│         • Bug fixes                                                         │
│         • New features                                                     │
│         • Performance tuning                                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### In This Project: Revenue Desk

| Phase | What We Did |
|-------|-------------|
| **Requirements** | Local businesses need to track leads and customers |
| **Design** | User → Workspace → Leads/Customers schema |
| **Implementation** | Next.js + Prisma + NextAuth |
| **Testing** | Manual browser testing |
| **Deployment** | (Later - Vercel) |

---

## 2. Understanding the Architecture

### Why This Stack?

| Layer | Technology | Why We Chose It |
|-------|------------|-----------------|
| **Frontend** | React/Next.js | Server components, SEO, fast |
| **Styling** | Tailwind CSS | Utility classes, rapid dev |
| **Backend** | Next.js API Routes | Same repo, easy deployment |
| **Database** | SQLite → PostgreSQL | Dev → Production |
| **ORM** | Prisma | Type-safe queries |
| **Auth** | NextAuth | Complete auth solution |

### How Data Flows

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│  Next.js API │────▶│   Database  │
│   (React)    │◀────│   Routes     │◀────��   (Prisma)   │
└──────────────┘     └──────────────┘     └──────────────┘
     │                    │
     │                    ▼
     │              ┌──────────────┐
     │              │  NextAuth    │
     │              │  (JWT Auth)  │
     │              └──────────────┘
     │
     ▼
┌──────────────┐
│   Session   │
│   (Cookie)  │
└──────────────┘
```

### Project Structure Explained

```
revenue-desk/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Protected routes
│   │   │   ├── leads/          # Leads page
│   │   │   └── customers/      # Customers page
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Auth endpoints
│   │   │   ├── leads/          # Lead CRUD
│   │   │   └── customers/      # Customer CRUD
│   │   ├── auth/               # Public auth pages
│   │   └── layout.tsx          # Root layout
│   ├── components/             # Reusable UI components
│   │   ├── Dashboard/          # Dashboard components
│   │   ├── Sidebar/            # Navigation
│   │   └── ...
│   ├── lib/                    # Utilities
│   │   ├── prisma.ts           # DB connection
│   │   └── auth.ts             # Auth config
│   └── types/                  # TypeScript types
├── prisma/
│   └── schema.prisma           # Database schema
└── package.json
```

---

## 3. Database Design

### Our Schema (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String?  // Nullable for OAuth users
  role      String   @default("USER")
  
  workspaceId String?  // Foreign key
  workspace   Workspace? @relation(...)
}

model Workspace {
  id    String @id @default(cuid())
  name  String
  slug  String @unique
  
  users     User[]
  leads     Lead[]
  customers Customer[]
}

model Lead {
  id     String @id @default(cuid())
  name   String
  status String @default("NEW")  // NEW, CONTACTED, QUALIFIED, LOST, WON
  
  workspaceId String  // Required foreign key
  workspace   Workspace @relation(...)
}
```

### Why These Decisions?

| Decision | Why |
|----------|-----|
| **Workspace** | Multi-tenant - one DB, multiple businesses |
| **Nullable workspaceId** | Users can exist without workspace (admins) |
| **Cascade Delete** | When workspace is deleted, leads are too |
| **Status as String** | Simpler than enums for SQLite |

### Database Relationships

```
┌─────────────┐       ┌─────────────┐
│   Workspace │──1:N──│    User     │
└─────────────┘       └─────────────┘
       │
       │
       ├──────1:N──▶ Lead
       │
       └──────1:N──▶ Customer
```

---

## 4. API Design

### REST API Conventions

| Method | Path | Action |
|--------|------|--------|
| `GET` | `/api/leads` | List all leads |
| `POST` | `/api/leads` | Create lead |
| `GET` | `/api/leads/[id]` | Get single lead |
| `PUT` | `/api/leads/[id]` | Update lead |
| `DELETE` | `/api/leads/[id]` | Delete lead |

### Our API Implementation

**`GET /api/leads`** - List all leads for current user's workspace:

```typescript
export async function GET() {
  // 1. Get current user's session
  const session = await auth();
  
  // 2. Check if authorized
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // 3. Query database with workspace filter
  const leads = await prisma.lead.findMany({
    where: { workspaceId: session.user.workspaceId },
    orderBy: { createdAt: "desc" },
  });
  
  // 4. Return response
  return NextResponse.json(leads);
}
```

**`POST /api/leads`** - Create a new lead:

```typescript
export async function POST(req: Request) {
  // 1. Get session
  const session = await auth();
  
  // 2. Check authorization
  if (!session?.user?.workspaceId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // 3. Parse and validate request body
  const body = await req.json();
  const { name, email, phone, source, status, notes } = body;
  
  // 4. Create in database
  const lead = await prisma.lead.create({
    data: {
      name,
      email,
      phone,
      source,
      status: status || "NEW",
      notes,
      workspaceId: session.user.workspaceId,  // Always link to workspace!
    },
  });
  
  // 5. Return created resource
  return NextResponse.json(lead);
}
```

### HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Logged in but no permission |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Something broke |

---

## 5. Authentication & Security

### How Our Auth Works

```
┌────────────────────────────────────────────────────────────┐
│                      AUTHENTICATION FLOW                     │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  SIGN UP:                                                   │
│  ┌─────────┐    ┌──────────┐    ┌─────────────┐            │
│  │  User   │───▶│ Register │───▶│ Create User  │            │
│  │  Form   │    │   API    │    │ + Workspace  │            │
│  └─────────┘    └──────────┘    └─────────────┘            │
│       │                                    │                 │
│       ▼                                    ▼                 │
│  ┌─────────┐                        ┌──────────┐          │
│  │ Sign In │◀────────────────────────│  JWT     │          │
│  │  Form   │                         │ Created  │          │
│  └─────────┘                        └──────────┘          │
│                                                             │
│  AUTHENTICATED REQUESTS:                                    │
│  ┌─────────┐    ┌──────────┐    ┌─────────────┐          │
│  │ Request │───▶│ NextAuth  │───▶│   Route     │          │
│  │ + JWT   │    │  Middle  │    │  Handler    │          │
│  └─────────┘    └──────────┘    └─────────────┘          │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Security Best Practices (In Our Code)

| Practice | Example |
|----------|---------|
| **Hash passwords** | `bcrypt.hash(password, 12)` |
| **Check ownership** | `where: { id, workspaceId: session.user.workspaceId }` |
| **Validate input** | `registerSchema.parse(body)` |
| **HTTP status codes** | Return 401 for unauthorized |
| **Don't expose sensitive data** | Never return passwords in API |

---

## 6. Frontend Development

### Component Structure

```typescript
// 1. Client Component Directive
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export default function LeadsPage() {
  // 2. State management
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 3. Session access
  const { data: session } = useSession();
  
  // 4. Data fetching
  useEffect(() => {
    if (session) {
      fetchLeads();
    }
  }, [session]);
  
  // 5. Event handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ... submit logic
  };
  
  // 6. Render
  return (
    <div>
      {loading ? <p>Loading...</p> : <Table data={leads} />}
    </div>
  );
}
```

### Data Flow in React

```
┌────────────────────────────────────────────────────────┐
│                    DATA FLOW                             │
├────────────────────────────────────────────────────────┤
│                                                         │
│   useEffect                                              │
│      │                                                   │
│      ▼                                                   │
│   fetch("/api/leads")  ────────────────────────────────▶ │
│                                                   │     │
│   Response ←──────────────────────────────────────┘     │
│      │                                                   │
│      ▼                                                   │
│   setLeads(data)  ───▶  leads state updates            │
│                            │                             │
│                            ▼                             │
│                      Component Re-renders                │
│                            │                             │
│                            ▼                             │
│                      UI Updates                          │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### Form Handling Pattern

```typescript
// 1. State for form data
const [formData, setFormData] = useState({
  name: "",
  email: "",
  phone: "",
});

// 2. Input change handler
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

// 3. Form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  
  if (res.ok) {
    fetchLeads();  // Refresh list
    setFormData({ name: "", email: "", phone: "" });  // Reset form
  }
};

// 4. Render form
<form onSubmit={handleSubmit}>
  <input
    name="name"
    value={formData.name}
    onChange={handleChange}
  />
  <button type="submit">Submit</button>
</form>
```

---

## 7. Code Patterns & Best Practices

### Always Check Authorization

```typescript
// ❌ BAD - Anyone can access any lead
const lead = await prisma.lead.findUnique({ where: { id } });

// ✅ GOOD - Only access own workspace's leads
const lead = await prisma.lead.findFirst({
  where: {
    id,
    workspaceId: session.user.workspaceId,
  },
});
```

### Always Validate Input

```typescript
// ❌ BAD - Trusts user input
const { name } = req.body;

// ✅ GOOD - Validates with Zod
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const { name } = registerSchema.parse(req.body);
```

### Type Your Data

```typescript
// ❌ BAD - No type safety
const leads = await fetchLeads();

// ✅ GOOD - Full type safety
interface Lead {
  id: string;
  name: string;
  email: string | null;
  status: string;
}

const leads: Lead[] = await fetchLeads();
```

### Use Async/Await Properly

```typescript
// ❌ BAD - Promise chaining
fetch("/api/leads")
  .then(res => res.json())
  .then(data => setLeads(data));

// ✅ GOOD - Async/await
const res = await fetch("/api/leads");
const data = await res.json();
setLeads(data);
```

---

## 8. Common Patterns Explained

### Multi-Tenant Pattern

> **Problem**: One database, multiple businesses, each seeing only their own data.

**Solution**: Every table has a `workspaceId`. All queries filter by it.

```typescript
// Every query includes workspaceId
const leads = await prisma.lead.findMany({
  where: { workspaceId: session.user.workspaceId }
});
```

### CRUD Pattern

```
Create ──▶ Read ──▶ Update ──▶ Delete
  │         │         │         │
  ▼         ▼         ▼         ▼
 POST     GET      PUT      DELETE
```

### Modal Pattern

```typescript
// State to track if modal is open
const [showModal, setShowModal] = useState(false);

// Open modal
const openModal = () => setShowModal(true);

// Close modal
const closeModal = () => setShowModal(false);

// Conditional rendering
{showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      {/* Modal content */}
    </div>
  </div>
)}
```

### Loading State Pattern

```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchData().finally(() => setLoading(false));
}, []);

if (loading) return <p>Loading...</p>;

return <DataTable data={data} />;
```

---

## 9. Debugging & Problem Solving

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `window is not defined` | SSR accessing browser API | Add `"use client"` or dynamic import |
| `Cannot read property of undefined` | Accessing null value | Add null checks, optional chaining |
| `Type error` | Wrong type used | Use proper TypeScript types |
| `401 Unauthorized` | Not logged in | Check auth flow |
| `404 Not Found` | Wrong route | Verify API path |

### Debug Techniques

```typescript
// 1. Console logging
console.log("Variable value:", variable);

// 2. Check response
const res = await fetch("/api/leads");
console.log("Status:", res.status);
console.log("Data:", await res.json());

// 3. Error boundary
try {
  await riskyOperation();
} catch (error) {
  console.error("Error:", error);
}
```

### Next.js Error Messages

| Message | Meaning |
|---------|---------|
| `Dynamic server usage` | Page needs server rendering |
| `force-dynamic` needed | Add `export const dynamic = "force-dynamic"` |
| `Client component` | Component uses client features |
| `useEffect runs twice` | Strict mode in development (normal) |

---

## 10. Career Growth

### Junior → Mid Skills Progression

| Skill | Junior | Mid |
|-------|--------|-----|
| **Code** | Can write working code | Clean, maintainable code |
| **Debugging** | Fix simple bugs | Debug complex issues |
| **Architecture** | Follow patterns | Design solutions |
| **Communication** | Ask questions | Explain decisions |
| **Testing** | Test own code | Write testable code |

### What to Learn Next

1. **Testing**: Jest, React Testing Library
2. **State Management**: Zustand, React Query
3. **Performance**: Code splitting, caching
4. **DevOps**: CI/CD, monitoring
5. **Design Patterns**: SOLID, common patterns

### Resources for Growth

- Read code of well-known projects
- Contribute to open source
- Build side projects
- Practice data structures & algorithms
- Learn system design basics

---

## Quick Reference

### Git Commands
```bash
git add .              # Stage changes
git commit -m "message" # Commit
git push               # Push to remote
git pull               # Pull from remote
git status             # Check status
```

### Next.js Commands
```bash
npm run dev            # Start dev server
npm run build          # Production build
npm run lint           # Lint code
```

### Prisma Commands
```bash
npx prisma migrate dev   # Create migration
npx prisma generate       # Generate client
npx prisma studio         # Open DB viewer
```

---

## The Bigger Picture

### Why We Build Software

1. **Solve Problems**: Real users have real needs
2. **Automate**: Replace manual work with systems
3. **Scale**: Systems handle more than humans
4. **Learn**: We grow by building

### The Developer Mindset

- **Curiosity**: Why does this work?
- **Patience**: Bugs take time to fix
- **Pragmatism**: Perfect is enemy of good
- **Collaboration**: Code review, pairing, questions
- **Growth**: Always learning new things

### Remember

> "The best code is no code at all. The second best code is code that works." - Jeff Atwood

Start simple, iterate, improve. Every expert was once a beginner.