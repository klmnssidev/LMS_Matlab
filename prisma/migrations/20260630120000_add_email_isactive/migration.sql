-- Create new Role enum (same values, new name)
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STUDENT', 'TEACHER');

-- Add new columns to user_accounts (email nullable first for backfill)
ALTER TABLE "user_accounts"
  ADD COLUMN "email" VARCHAR(120),
  ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill email from linked Student records
UPDATE "user_accounts" ua
SET "email" = s."email"
FROM "students" s
WHERE ua."student_id" = s."student_id" AND ua."email" IS NULL;

-- Backfill email from linked Teacher records
UPDATE "user_accounts" ua
SET "email" = t."email"
FROM "teachers" t
WHERE ua."teacher_id" = t."teacher_id" AND ua."email" IS NULL;

-- Backfill email from linked Admin records
UPDATE "user_accounts" ua
SET "email" = a."email"
FROM "admins" a
WHERE ua."admin_id" = a."admin_id" AND ua."email" IS NULL;

-- Make email NOT NULL and UNIQUE
ALTER TABLE "user_accounts" ALTER COLUMN "email" SET NOT NULL;
CREATE UNIQUE INDEX "user_accounts_email_key" ON "user_accounts"("email");

-- Migrate role column to new enum type
ALTER TABLE "user_accounts" ALTER COLUMN "role" TYPE "Role" USING "role"::text::"Role";

-- Drop admin_id FK constraint and column
ALTER TABLE "user_accounts" DROP CONSTRAINT IF EXISTS "user_accounts_admin_id_fkey";
DROP INDEX IF EXISTS "user_accounts_admin_id_key";
ALTER TABLE "user_accounts" DROP COLUMN "admin_id";

-- Drop old UserRole enum
DROP TYPE IF EXISTS "UserRole";
