# System Architecture

## Backend

Browser

↓

Next.js

↓

API Route

↓

Controller

↓

Service

↓

Repository

↓

Prisma

↓

PostgreSQL

---

# Responsibilities

Controller

- Validate
- Authorize
- Call Service

Service

- Business Logic

Repository

- Prisma Queries
- AuthorizationScope

Prisma

- Database Access Only

---

# Authentication

Clerk

↓

Authentication

---

# Authorization

CASL

↓

Permission

AuthorizationScope

↓

Ownership

Repository

↓

Data Filtering

---

# Important Rules

Never

Controller → Prisma

Never

Component → fetch()

Never

Service → Prisma

Never

CASL → Ownership

Never

Clerk → Roles

---

# Ownership

Student

↓

studentId

Teacher

↓

teacherId

Admin

↓

No restriction

Ownership filtering belongs ONLY inside repositories.