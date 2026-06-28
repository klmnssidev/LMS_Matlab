<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project
Next.js 16.2.9 university management dashboard. Clerk auth + RBAC, PostgreSQL (pg driver), shadcn/ui + recharts.

## Key Conventions
- `currentUser().publicMetadata.role` for RBAC (not `sessionClaims`)
- `currentUser().publicMetadata.db_id` for student/teacher DB ID in client components
- `pg` Pool in `src/lib/db.ts`, `POSTGRES_URL` env var
- Tailwind v4: `gap-*` over `space-y-*`, `size-*` over `h-* w-*`, `cn()` for merging
- shadcn/base-ui: `render` prop (not `asChild`), `Select` uses `items` + `onValueChange`
- Forms: `FieldGroup`/`Field`/`FieldLabel`/`FieldError` + `react-hook-form` + `Controller` for Selects
- API routes skip Clerk middleware; each route calls `requireRole()` internally
- `dateString()` / `dateStringNullable()` zod preprocessors for date fields
- Architecture: Database → Prisma → Repository → Service → Controller → API → Hooks → UI (no layers skipped)

## Status
- **All features migrated** to Prisma ORM + TanStack Query hooks:
  - Students, Teachers, Courses, Enrollments, Attendance, Posters
  - Exam Results, My Courses, My Grades
  - Admin/Teacher/Student Dashboards
- Each migrated feature has: Prisma schema (PascalCase + `@map`/`@@map`), server layer (schema → repository → service → controller), client layer (api service → hooks → refactored components)
- 14 API routes all delegate to controllers: students, teachers, courses, enrollments, attendance, posters, exam-results, stats, my-stats, course-offerings, departments, users/sync, webhooks/clerk
- TanStack Query `QueryClientProvider` in root layout
- Zustand sidebar store (`useSidebarStore`)
- Prisma singleton with `@prisma/adapter-pg` in `src/server/lib/prisma.ts`
- All dashboard components using `useAdminStats()` / `useMyStats()` TanStack Query hooks
- Build passes with 0 errors

## Key Decisions
- `requireRole()` reused from student.ability.ts across all features
- Client-side pagination retained for Enrollments and Attendance
- Poster image GET uses `new Uint8Array(buffer)` — `Bytes` Prisma type casts with `as never`
- Stats service uses `prisma.$queryRaw` for complex aggregate queries (studentsByDepartment, enrollmentTrend, gradeDistribution, upcomingExams, attendance summaries)
- Dashboard hooks stateless — re-fetch on mount via TanStack Query (no staleTime customization)
- `@clerk/nextjs/server` module used for server-side `currentUser()` in stats controller

## Still Needed (Management UIs)
- Enrollment creation/edit form
- Attendance creation/edit form (bulk entry)
- Exam results management UI (admin/teacher)
- Course offering management

## Critical Context
- Prisma 7.8.0 with `@prisma/adapter-pg` — constructor uses `new PrismaClient({ adapter })`
- `pg` package remains installed (needed by `@prisma/adapter-pg`)
- DB: PostgreSQL 16 on localhost:5432, database `adv_db`, 12 tables
- `.env`: `DATABASE_URL=postgresql://_klmnssi:postgres@localhost:5432/adv_db`
- Route conflicts exist between `(dashboard)` route group and root `/students`, `/courses`, `/teachers` routes
- Old `src/services/`, `src/lib/db.ts`, `src/lib/rbac.ts` deleted — all code uses Prisma + TanStack Query
