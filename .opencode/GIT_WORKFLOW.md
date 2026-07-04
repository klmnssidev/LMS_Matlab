# Git Workflow

Never develop directly on main.

Every feature starts with

git switch -c feat/feature-name

Examples

feat/exam-management

feat/student-dashboard

feat/transcript

fix/auth-loop

refactor/stats-service

---

One Feature

↓

One Branch

↓

One Pull Request

---

Conventional Commits

feat(exams): implement exam management

fix(auth): prevent redirect loop

refactor(stats): extract academic helpers

docs(api): update auth flow

---

Pull Request Checklist

- Build passes

- TypeScript passes

- ESLint passes

- No dead code

- Repository Pattern preserved

- Authorization preserved

- CASL preserved

- AuthorizationScope preserved

- No Prisma outside repositories

- CodeRabbit review completed

---

CodeRabbit

Classify every review

Must Fix

Should Fix

Optional

Reject

Never blindly accept suggestions.