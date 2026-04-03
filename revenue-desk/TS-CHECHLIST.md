# TypeScript Quick Start Guide

**Goal**: Learn TypeScript by building our Revenue Desk SaaS

---

## Why TypeScript?

- Catches errors **before** runtime
- Self-documenting code
- Better IDE support (autocomplete, refactoring)

---

## Core Types

```typescript
// Primitives
let name: string = "John";
let age: number = 25;
let isActive: boolean = true;

// Arrays
let scores: number[] = [90, 85, 88];
let names: string[] = ["Alice", "Bob"];

// Objects
type User = {
  name: string;
  age: number;
  email?: string;  // ? = optional
};

let user: User = {
  name: "John",
  age: 25
};
```

---

## Function Types

```typescript
// Explicit return type
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// With optional param
function greet(name: string, greeting?: string): string {
  return greeting ? `${greeting}, ${name}!` : `Hello, ${name}!`;
}
```

---

## Type Aliases & Interfaces

```typescript
// Interface (common in React/Next.js)
interface Lead {
  id: string;
  name: string;
  email: string;
  status: "new" | "contacted" | "closed";
}

// Type alias (interchangeable, more flexible)
type Customer = {
  id: string;
  name: string;
  totalSpent: number;
};

// Extending interfaces
interface BusinessLead extends Lead {
  company: string;
  employees: number;
}
```

---

## The `any` Type (Avoid!)

```typescript
// Bad - loses TypeScript benefits
let data: any = "hello";
data = 123;  // no error, no intellisense

// Good - use specific types
let data: string | number = "hello";
data = 123;  // works, still type-safe
```

---

## TypeScript in Next.js

```typescript
// app/page.tsx
// Type for component props
interface PageProps {
  params: { id: string };
  searchParams: { sort?: string };
}

export default function Page({ params }: PageProps) {
  return <div>Product {params.id}</div>;
}

// API Route - request/response types
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "Hello" });
}
```

---

## Where You'll Use It

| File | Usage |
|------|-------|
| `src/types/*.ts` | Define data shapes (Lead, Product, User) |
| Components | Props typing, state types |
| API Routes | Request/response types |
| Hooks | Return value types |

---

## Quick Reference

```typescript
// Union types
type Status = "pending" | "approved" | "rejected";

// Enum
enum Role {
  Admin = "admin",
  User = "user",
}

// Generic
function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}
```

---

## Practice Task

Look at `src/types/Lead.ts` and create a `Customer` type for a local business (fields: name, email, phone, address, totalOrders, totalSpent).