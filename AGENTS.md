<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project
Next.js 16.2.9 university management dashboard. Clerk auth + CASL authorization (via `@casl/ability`), PostgreSQL (pg driver), shadcn/ui + recharts.

## Key Conventions
- Authentication: Clerk only — `auth()` for server, `useUser()` for client
- Authorization: CASL only — never `if(role === "...")`, never `requireRole()`; always use `authorize()` / `authorizePage()` / `<Can>`
- **Role source**: The database is the only source of truth. Never read `publicMetadata.role`, never call `currentUser()` for authorization.
- Identity layer: `UserAccount` table with `clerkUserId`, `role`, and optional FK to `Student`/`Teacher`/`Admin`
- Tailwind v4: `gap-*` over `space-y-*`, `size-*` over `h-* w-*`, `cn()` for merging
- shadcn/base-ui: `render` prop (not `asChild`), `Select` uses `items` + `onValueChange`
- Forms: `FieldGroup`/`Field`/`FieldLabel`/`FieldError` + `react-hook-form` + `Controller` for Selects
- API routes skip Clerk middleware; each route delegates to controllers which call `authorize()` or `getAbility()` internally
- `dateString()` / `dateStringNullable()` zod preprocessors for date fields
- Architecture: Database → Prisma → Repository → Service → Controller → API → Hooks → UI (no layers skipped)

## Identity & Authorization Architecture

```
Clerk auth().userId
  ↓
UserAccount.findByClerkId(userId)
  ↓
{ role: ADMIN | STUDENT | TEACHER, studentId?, teacherId? }
  ↓
abilityFactory → defineAdminAbility / defineStudentAbility(studentId) / defineTeacherAbility(teacherId)
  ↓
Application (authorize(), authorizePage(), <Can>)
```

### UserAccount Table
Unified identity layer. All authenticated users have exactly one `UserAccount` record.
- `clerkUserId` (unique, nullable) — Clerk user ID, set on sign-in via webhook auto-link or account linking flow
- `role` (enum: ADMIN, STUDENT, TEACHER) — determines which ability is built
- `studentId` (unique, nullable FK to `students`) — linked Student domain record
- `teacherId` (unique, nullable FK to `teachers`) — linked Teacher domain record
- `adminId` (unique, nullable FK to `admins`) — linked Admin domain record

### Admin Creation
- Admin accounts are created internally (seeded in DB or via admin panel)
- No public registration, no invite codes
- When an Admin signs up with Clerk, the webhook auto-links by email
- Admins skip `/complete-profile` entirely

### Account Linking (Student / Teacher)
- New Clerk users with no matching Student/Teacher/Admin record go to `/complete-profile`
- They enter `studentNumber` or `employeeNumber` to link their Clerk account
- This creates a `UserAccount` record with the appropriate role
- After linking, full page reload (`window.location.href`) forces fresh Clerk session data

### Webhook Auto-Link
- On `user.created`, the webhook checks if the email matches a Student, Teacher, or Admin record
- If a match is found with no existing UserAccount, it creates one (auto-link)
- If no match, no UserAccount is created — user goes to `/complete-profile`
- No `publicMetadata.role` is ever read or written
- `user.updated` is not processed (metadata updates are unnecessary)

## Authorization System (CASL)

### Module: `src/permissions/`
- `actions.ts` — Reusable action types: `manage`, `create`, `read`, `update`, `delete`, `approve`, `grade`, `export`
- `subjects.ts` — All entity subjects: `Student`, `Teacher`, `Course`, `Enrollment`, `CourseOffering`, `Attendance`, `Exam`, `ExamResult`, `Poster`, `Dashboard`, `Analytics`, `Settings`, `Announcement`, `MyEnrollments`, `MyGrades`
- `types.ts` — `AppAbility` type (`MongoAbility<[Action, string]>`), `AbilityContext` with role, userId, teacherId?, studentId?
- `errors.ts` — `ForbiddenError`, `UnauthorizedError`, `AccountNotLinkedError`, `ResourceNotFoundError`
- `ability.factory.ts` — `getAbility()` reads `UserAccount` by `clerkUserId`, switches on role to build the appropriate ability. Throws `AccountNotLinkedError` if no UserAccount found. No Clerk metadata fallback.
- `helpers.ts` — `authorize(action, subject)`, `authorizePage(action, subject)`, `getErrorResponse()`
- `abilities/admin.ability.ts` — `can("manage", "all")`
- `abilities/teacher.ability.ts` — Scoped to own course offerings: read own Teacher profile, CourseOfferings, enrolled Students, Enrollments, Attendance, Exams, ExamResults, Courses, Department/Semester/Classroom/Poster reference data, Dashboard, Analytics
- `abilities/student.ability.ts` — Self-service only: `MyEnrollments`, `MyGrades`, `Course`, `Poster`, `Announcement`, `Dashboard`. No `can("read", "Student")` — students never pass the general subject check, preventing access to `/students`, `/enrollments`, `/attendance`, `/exam-results` pages. Self-service API endpoints use `MyEnrollments`/`MyGrades` instead.

### Controllers
Each controller calls `authorize("action", "Subject")` at the top of each handler. For mutations (update/delete), the resource is first fetched, then `ctx.ability.can("action", resource)` checks ownership.

### Page Components
Server-side: `authorizePage("action", "Subject")` at the top of page components — redirects to `/sign-in` or `/`.
Dashboard page: Client component using `useAbility()` to determine role for dashboard component selection. Redirects to `/complete-profile` if `role` is null (not linked).

### UI Components
Client-side: `<Can I="action" a="Subject">` component wraps conditionally visible UI elements. Uses `useAbility()` hook (fetches rules from `GET /api/ability`, reconstructs via `createMongoAbility`).

### Ownership Rules
- Teacher: `can("read", "Student", { enrollments: { offering: { teacherId } } })` — students only in own course offerings
- Student: Uses self-service subjects (`MyEnrollments`, `MyGrades`) — API controllers switch to these subjects via `isSelf ? "MyEnrollments" : "Enrollment"` pattern. General subject rules with conditions are NOT used (CASL returns `true` for `can("read", "Enrollment")` even with conditions, giving false page access).
- Admin: `can("manage", "all")` — everything

### Adding a New Role
1. Add role to `UserRole` enum in Prisma schema
2. Create `src/permissions/abilities/new-role.ability.ts` with `defineNewRoleAbility(context)`
3. Add the role to `ability.factory.ts` `getAbility()` switch
4. Define abilities with `can()` statements reusing existing actions/subjects
5. No other code changes needed — controllers, pages, and UI all use CASL

## Status
- **All features migrated** to Prisma ORM + TanStack Query hooks:
  - Students, Teachers, Courses, Enrollments, Attendance, Posters
  - Exam Results, My Courses, My Grades
  - Admin/Teacher/Student Dashboards
- **Unified identity layer**: `UserAccount` table replaces direct `clerkUserId` on Student/Teacher. All role resolution goes through `UserAccount.role`.
- **No Clerk metadata dependency**: `publicMetadata.role` is never read or written. DB is the sole source of truth for roles.
- Each migrated feature has: Prisma schema (PascalCase + `@map`/`@@map`), server layer (schema → repository → service → controller), client layer (api service → hooks → refactored components)
- 14 API routes all delegate to controllers: students, teachers, courses, enrollments, attendance, posters, exam-results, stats, my-stats, course-offerings, departments, webhooks/clerk
- TanStack Query `QueryClientProvider` in root layout
- Prisma singleton with `@prisma/adapter-pg` in `src/server/lib/prisma.ts`
- All dashboard components using `useAdminStats()` / `useMyStats()` TanStack Query hooks
- Build passes with 0 errors
- `requireRole()` / `requirePageRole()` deleted — replaced by CASL
- `currentUser()` / `publicMetadata.role` completely removed

## Key Decisions
- Conditions use `as any` cast in ability definitions (CASL v7 string union limitation)
- Ownership on resource mutations: fetch resource first, then `ability.can(action, resource)`
- List scoping via user context (teacherId/studentId) from `getAbility()` passed as filters
- `UserAccount` table instead of `clerkUserId` on Student/Teacher — clean separation of identity and domain
- `clerkUserId` is nullable on UserAccount — allows pre-seeding records before user signs up
- Webhook auto-links by email on `user.created` — pre-seeded Student/Teacher/Admin users skip `/complete-profile`
- No `publicMetadata.role` — all role resolution is DB-only; removes Clerk metadata as auth source
- `GET /api/ability` endpoint serves serialized rules for client-side useAbility hook
- After account linking, `window.location.href = "/"` forces full reload so Clerk session picks up fresh data
- `MyEnrollments` and `MyGrades` subjects in student ability block Teacher access to student-only pages
- Student ability never uses `can("read", "Student", { conditions })` — conditional rules make `can("read", "Student")` return true in CASL, giving students false page access. Instead, self-service controllers switch subjects to `MyEnrollments`/`MyGrades` for student-accessible endpoints
- `@casl/prisma` not installed — context injection preferred over Prisma-scoped queries

## Management UIs (All Done)
- Course Offering management: list, create, edit, delete via `/course-offerings/*`
- Enrollment creation form: `/enrollments/new`
- Bulk Attendance entry: `/attendance/new` — select offering, mark all students present/absent/late/excused
- Exam Results management: list + delete via `/exam-results`, create via `/exam-results/new`

## Critical Context
- Prisma 7.8.0 with `@prisma/adapter-pg` — constructor uses `new PrismaClient({ adapter })`
- `pg` package remains installed (needed by `@prisma/adapter-pg`)
- DB: PostgreSQL 16 on localhost:5432, database `adv_db`, 13 tables (12 domain + 1 user_accounts)
- `.env`: `DATABASE_URL=postgresql://_klmnssi:postgres@localhost:5432/adv_db`
- Route conflicts exist between `(dashboard)` route group and root `/students`, `/courses`, `/teachers` routes
- Old `src/services/`, `src/lib/db.ts`, `src/lib/rbac.ts` deleted — all code uses Prisma + TanStack Query
- Old `src/server/permissions/student.ability.ts` deleted — replaced by `src/permissions/`
- `ability.can("manage", "all")` correctly restricts to Admin only
- `ability.can("read", "Student")` correctly restricts to Admin and Teacher only (student ability has no rule)
- Build passes with 0 errors; TypeScript strict mode
- `clerkUserId` column removed from `students` and `teachers` tables — migrated to `user_accounts`
- `admins` table added for Admin domain records
