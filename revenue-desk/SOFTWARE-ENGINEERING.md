# Software Engineering Guide

**Goal**: Understand the why, when, what, and how of building software - not just the syntax.

---

## 1. Why Do We Build Software This Way?

### Why RESTful APIs?
- **Stateless**: Each request contains all info needed - simple, scalable
- **Industry Standard**: Everyone understands it - easier integration
- **Separation of Concerns**: Frontend and backend evolve independently

### Why Authentication Tokens (JWT)?
- **Stateless**: Server doesn't store sessions - scales horizontally
- **Secure**: Signed tokens can't be forged
- **Mobile-friendly**: Works across devices without session stores

### Why Database Schemas?
- **Data Integrity**: Prevents garbage data entering system
- **Performance**: Indexes make queries fast
- **Relationships**: Connect entities (users → workspaces → leads)

---

## 2. When to Use What

### When to Use SQL vs NoSQL
| Use SQL When | Use NoSQL When |
|--------------|----------------|
| Data has relationships | Unstructured data |
| Need strict data integrity | Rapid prototyping |
| Complex queries/aggregations | High write throughput |
| Financial/transactional data | Caching, analytics |

### When to Use Authentication
| Method | Use Case |
|--------|----------|
| JWT Tokens | APIs, SPAs, mobile apps |
| Session Cookies | Traditional web apps |
| OAuth/SSO | Social logins, enterprise |

### When to Use Which API Style
| Style | When |
|-------|------|
| REST | Most web apps - standard CRUD |
| GraphQL | Complex data fetching - reduce over-fetching |
| WebSocket | Real-time - chat, live updates |

---

## 3. What is This Project Structure?

### Why App Router (Next.js)?
- **Server Components**: Less JS sent to browser - faster
- **File-based Routing**: Simple, predictable URLs
- **API Routes**: Backend without separate server
- **SEO**: Server-rendered HTML = search engines love it

### Why Prisma?
- **Type Safety**: DB queries are type-checked
- **Migration System**: Version control for database
- **Abstraction**: Works with MySQL, PostgreSQL, SQLite

### Why Workspace Multi-Tenant?
- **Single Database**: One DB, multiple businesses
- **Data Isolation**: Each workspace sees only own data
- **Cost**: Cheaper hosting than separate DBs

---

## 4. How Decisions Are Made

### Security Standards
1. **Passwords**: Always hash (bcrypt), never store plain
2. **Authorization**: Check workspace ownership on every query
3. **Input Validation**: Sanitize all user input (Zod)
4. **HTTPS**: Encrypt data in transit

### API Design
1. **REST Methods**: GET=read, POST=create, PUT=update, DELETE=delete
2. **Status Codes**: 200=success, 201=created, 400=bad request, 401=unauthorized, 404=not found, 500=server error
3. **Error Messages**: Return useful errors, not just "error"

### Database Design
1. **Normalize**: Avoid duplicate data
2. **Index**: Add indexes on columns you query by
3. **Cascade**: Delete related data when parent deleted

---

## 5. Software Development Lifecycle

```
1. Requirements → What problem are we solving?
2. Design → How will it work? (DB schema, API design, UI mockups)
3. Development → Code the features
4. Testing → Does it work? (manual + automated)
5. Deployment → Ship to production
6. Maintenance → Fix bugs, add features
```

### In This Project
- **Requirements**: Local businesses need CRM, leads, customers
- **Design**: Users → Workspaces → Leads/Customers schema
- **Development**: Next.js frontend, Prisma DB, NextAuth
- **Testing**: Manual testing via browser
- **Deployment**: (Later - Vercel, Railway, etc.)

---

## 6. Critical Patterns

### Always Validate Input
```typescript
// BAD - trusts user input
const { name } = req.body;

// GOOD - validates input
const { name } = registerSchema.parse(req.body);
```

### Always Check Ownership
```typescript
// BAD - allows accessing any lead
const lead = await prisma.lead.findUnique({ where: { id } });

// GOOD - only accesses own workspace's leads
const lead = await prisma.lead.findFirst({
  where: { id, workspaceId: session.user.workspaceId }
});
```

### Never Expose Sensitive Data
```typescript
// BAD - returns password hash
return NextResponse.json(user);

// GOOD - returns only safe fields
return NextResponse.json({ id: user.id, email: user.email });
```

---

## 7. Understanding the Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | React/Next.js | Component-based, server rendering |
| Styling | Tailwind CSS | Utility classes, fast dev |
| Backend | Next.js API Routes | Same repo, easy deployment |
| Database | SQLite → PostgreSQL | Local dev → production |
| ORM | Prisma | Type-safe DB access |
| Auth | NextAuth | Complete auth solution |

---

## 8. Later: Python Backend

When switching to Python (Django/FastAPI):
- Similar patterns: ORM, JWT auth, REST APIs
- Django has built-in admin, auth, ORM
- FastAPI is similar to Next.js API routes
- Keep same database design principles