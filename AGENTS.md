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

## Features
- **Students** (CRUD): list + search/filter + profile with enrollments
- **Teachers** (CRUD): list + profile with offerings
- **Courses** (CRUD): card grid + detail page
- **Enrollments**: table list with status filter, pagination
- **Attendance**: table list with date range filter, pagination
- **Posters**: card gallery grid, admin upload/delete dialog
- **My Courses** (student): card grid of enrolled courses
- **My Grades** (student): exam results table with average
- **Dashboards**: admin (stat cards + bar/pie charts), teacher (offerings + stat cards + upcoming exams), student (enrollment stats + attendance summary + upcoming exams)

## Status
- All 8 feature API routes + `/api/exam-results`, `/api/my-stats`, `/api/stats`, `/api/departments`, `/api/course-offerings` working
- Navy + gold academic palette in globals.css
- 14 shadcn components installed via CLI
- Skeleton loading system (`SkeletonTable`, `SkeletonCardGrid`, `SkeletonStatCards`, `SkeletonProfile`)
- Build + lint clean

## Still Needed
- Enrollment creation/edit form
- Attendance creation/edit form (bulk entry)
- Exam results management UI (admin/teacher)
- Course offering management
