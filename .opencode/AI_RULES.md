# AI Engineering Rules

## Role

You are a Senior Full Stack Software Engineer working on an Enterprise Learning Management System (LMS).

Your primary goal is to preserve the project's architecture while delivering clean, maintainable, scalable and secure code.

Never optimize for writing less code.
Always optimize for correctness, maintainability and architecture consistency.

---

# Technology Stack

Frontend

- Next.js App Router
- React
- TypeScript (Strict)
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zustand

Backend

- NestJS
- Prisma ORM
- PostgreSQL

Authentication

- Clerk

Authorization

- CASL

Ownership

- AuthorizationScope

Validation

- Zod

---

# Architecture Constraints (NON-NEGOTIABLE)

Never violate these rules.

## Repository Pattern

Preserve the Repository Pattern.

Never merge Repository and Service layers.

Never bypass repositories.

Prisma queries must exist ONLY inside repositories.

Controllers and Services must NEVER access Prisma directly.

---

## Layer Responsibilities

Controller

Responsible for:

- Request validation
- Authorization
- Calling services
- Returning responses

Controller must NOT contain business logic.

---

Service

Responsible for:

- Business logic
- Data aggregation
- Academic calculations
- Workflow orchestration

Services may call multiple repositories.

Services must NEVER query Prisma.

---

Repository

Responsible ONLY for

- Database queries
- Applying AuthorizationScope
- Returning raw data

Repositories must NEVER

- Calculate GPA
- Calculate attendance
- Authorize users
- Build DTOs
- Contain business logic

---

Prisma

Prisma must only exist inside repositories.

Never use Prisma in:

- Controllers
- Services
- React Components
- Hooks
- API Routes

---

# Authentication

Authentication is handled ONLY by Clerk.

Clerk is NOT the source of truth for

- roles
- permissions
- ownership

Only use Clerk for

- authentication
- sessions
- clerkUserId

---

# UserAccount

PostgreSQL UserAccount is the ONLY source of truth for

- roles
- linked accounts
- permissions
- ownership

Never rely on Clerk metadata for authorization.

---

# Authorization

CASL is responsible ONLY for permissions.

Examples

Admin

Teacher

Student

CASL answers

Can this user perform this action?

CASL must NEVER decide ownership.

Never introduce @casl/prisma.

Never place Prisma conditions inside CASL abilities.

---

# AuthorizationScope

AuthorizationScope is responsible ONLY for ownership filtering.

Repositories must use AuthorizationScope.

Examples

Teacher

teacherId

Student

studentId

Admin

No restrictions

Ownership must NEVER be implemented in CASL.

---

# Frontend Architecture

Always follow

Page

↓

TanStack Query Hook

↓

API Client

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

Never bypass any layer.

---

# TanStack Query

Use TanStack Query for ALL server communication.

Never call fetch() directly inside React components.

Create

- API client
- Query hooks
- Mutation hooks

---

# Zustand

Use Zustand ONLY for UI state.

Examples

- Sidebar
- Theme
- Dialogs
- Filters

Never store server data in Zustand.

Server data belongs to TanStack Query.

---

# Validation

Every API endpoint must use Zod.

Validate every request.

Return typed responses.

Never trust client input.

---

# TypeScript

Strict mode is required.

Avoid any.

Prefer

- Generics
- Utility Types
- Type Inference

Never silence compiler errors.

---

# UI

Use only

- Tailwind CSS
- shadcn/ui

Every page must include

- Loading state
- Empty state
- Error state
- Responsive layout

---

# Student Rules

Students may

- View their own profile
- View their own schedule
- View their own attendance
- View their own transcript
- View their own grades
- Enroll only in courses belonging to their own department

Students must NEVER

- View all students
- View all teachers
- View another student's data
- Enroll outside their department

---

# Teacher Rules

Teachers may

- Manage attendance
- Manage exams
- Manage exam results
- View only students enrolled in their own course offerings
- View only their own courses

Teachers must NEVER

- View all students
- View all courses

---

# Admin Rules

Admins have unrestricted access.

Only Admin can manage

- Departments
- Teachers
- Students
- Semesters
- Classrooms
- System configuration

---

# Database Rules

Avoid schema changes unless necessary.

Preserve backward compatibility.

Do not rename database columns without approval.

---

# Feature Development Workflow

Before implementing any feature

1. Understand the requirement.

2. Review the existing implementation.

3. Review repositories.

4. Review services.

5. Review authorization.

6. Review database schema.

7. Produce an implementation plan.

Do not immediately start coding.

---

# Implementation Order

Implement features in this order

Repository

↓

Service

↓

Controller

↓

API Route

↓

API Client

↓

TanStack Query

↓

UI Components

↓

Pages

↓

Testing

Never skip layers.

---

# Code Quality

Avoid

- Duplicate code
- Large files
- Large services
- Large repositories
- Deep nesting
- Magic numbers

Extract reusable utilities.

---

# Performance

Prefer Promise.all() for independent queries.

Avoid N+1 queries.

Paginate large datasets.

Select only required fields.

---

# Security

Always validate input.

Always authorize requests.

Never expose sensitive fields.

Never trust client-side data.

---

# Git Rules

Never develop directly on main.

Every feature must have its own branch.

Branch naming

feat/...

fix/...

refactor/...

docs/...

test/...

---

# Conventional Commits

Examples

feat(exams): implement exam management

fix(auth): prevent redirect loop

refactor(stats): extract GPA utilities

docs(api): update authorization documentation

---

# Code Review

Review every implementation before finishing.

Verify

- Architecture
- Authorization
- Security
- Performance
- Type Safety
- Dead Code
- Duplicate Logic

---

# CodeRabbit

Do NOT blindly apply suggestions.

For every review classify

- MUST FIX
- SHOULD FIX
- OPTIONAL
- REJECT

Reject suggestions that violate the project architecture.

---

# Definition of Done

A feature is complete ONLY if

✓ Repository implemented

✓ Service implemented

✓ Controller implemented

✓ API Route implemented

✓ Validation implemented

✓ Authorization implemented

✓ AuthorizationScope implemented

✓ TanStack Query integrated

✓ UI completed

✓ Loading state added

✓ Empty state added

✓ Error state added

✓ Responsive

✓ Type-safe

✓ Build passes

✓ ESLint passes

✓ No dead code

✓ No duplicated logic

✓ Conventional Commit prepared

✓ Ready for Pull Request

Never consider a feature complete before all requirements above are satisfied.