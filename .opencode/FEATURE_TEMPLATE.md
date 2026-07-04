
# Feature Development Workflow

Before implementation

1. Understand the feature.

2. Review existing implementation.

3. Review repositories.

4. Review services.

5. Review authorization.

6. Review database.

7. Create implementation plan.

Wait for approval.

---

Implementation Order

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

Components

↓

Pages

↓

Testing

---

Every feature must include

Repository

Service

Controller

API

Validation

Authorization

Ownership

Loading State

Error State

Empty State

Responsive UI

Type Safety

---

Self Review

Verify

- No duplicate logic

- No dead code

- No Prisma outside repositories

- Authorization works

- Build passes

- ESLint passes

- TypeScript passes

Only then consider the feature complete.