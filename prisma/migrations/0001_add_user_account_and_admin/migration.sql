-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STUDENT', 'TEACHER');

-- CreateTable
CREATE TABLE "admins" (
    "admin_id" SERIAL NOT NULL,
    "admin_name" VARCHAR(120) NOT NULL,
    "email" TEXT NOT NULL,
    CONSTRAINT "admins_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "user_accounts" (
    "id" SERIAL NOT NULL,
    "clerk_user_id" TEXT,
    "role" "UserRole" NOT NULL,
    "student_id" INTEGER,
    "teacher_id" INTEGER,
    "admin_id" INTEGER,
    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_clerk_user_id_key" ON "user_accounts"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_student_id_key" ON "user_accounts"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_teacher_id_key" ON "user_accounts"("teacher_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_admin_id_key" ON "user_accounts"("admin_id");

-- Migrate existing clerk_user_id from students to user_accounts
INSERT INTO user_accounts (clerk_user_id, role, student_id)
SELECT clerk_user_id, 'STUDENT'::"UserRole", student_id
FROM students
WHERE clerk_user_id IS NOT NULL;

-- Migrate existing clerk_user_id from teachers to user_accounts
INSERT INTO user_accounts (clerk_user_id, role, teacher_id)
SELECT clerk_user_id, 'TEACHER'::"UserRole", teacher_id
FROM teachers
WHERE clerk_user_id IS NOT NULL;

-- Drop clerk_user_id from students
ALTER TABLE students DROP COLUMN IF EXISTS clerk_user_id;

-- Drop clerk_user_id from teachers
ALTER TABLE teachers DROP COLUMN IF EXISTS clerk_user_id;

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("admin_id") ON DELETE SET NULL ON UPDATE CASCADE;
