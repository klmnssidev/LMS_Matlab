-- CreateTable
CREATE TABLE "departments" (
    "department_id" SERIAL NOT NULL,
    "department_code" VARCHAR(10) NOT NULL,
    "department_name" VARCHAR(100) NOT NULL,
    "faculty_name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("department_id")
);

-- CreateTable
CREATE TABLE "students" (
    "student_id" SERIAL NOT NULL,
    "department_id" INTEGER NOT NULL,
    "student_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(30),
    "gender" VARCHAR(10) NOT NULL,
    "date_of_birth" DATE,
    "admission_year" INTEGER NOT NULL,
    "status" VARCHAR(20) DEFAULT 'Active',
    "clerk_user_id" TEXT,
    "student_number" TEXT,

    CONSTRAINT "students_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "teachers" (
    "teacher_id" SERIAL NOT NULL,
    "department_id" INTEGER NOT NULL,
    "teacher_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(30),
    "academic_rank" VARCHAR(50) NOT NULL,
    "hire_date" DATE NOT NULL,
    "clerk_user_id" TEXT,
    "employee_number" TEXT,

    CONSTRAINT "teachers_pkey" PRIMARY KEY ("teacher_id")
);

-- CreateTable
CREATE TABLE "courses" (
    "course_id" SERIAL NOT NULL,
    "department_id" INTEGER NOT NULL,
    "course_code" VARCHAR(20) NOT NULL,
    "course_name" VARCHAR(150) NOT NULL,
    "credit_hours" INTEGER NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("course_id")
);

-- CreateTable
CREATE TABLE "semesters" (
    "semester_id" SERIAL NOT NULL,
    "semester_name" VARCHAR(50) NOT NULL,
    "academic_year" VARCHAR(20) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,

    CONSTRAINT "semesters_pkey" PRIMARY KEY ("semester_id")
);

-- CreateTable
CREATE TABLE "classrooms" (
    "classroom_id" SERIAL NOT NULL,
    "room_code" VARCHAR(20) NOT NULL,
    "building" VARCHAR(100) NOT NULL,
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("classroom_id")
);

-- CreateTable
CREATE TABLE "course_offerings" (
    "offering_id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "semester_id" INTEGER NOT NULL,
    "classroom_id" INTEGER NOT NULL,
    "section_name" VARCHAR(10) NOT NULL DEFAULT 'A',
    "max_students" INTEGER NOT NULL DEFAULT 40,

    CONSTRAINT "course_offerings_pkey" PRIMARY KEY ("offering_id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "enrollment_id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "offering_id" INTEGER NOT NULL,
    "enrollment_date" DATE NOT NULL,
    "status" VARCHAR(10) DEFAULT 'Active',
    "final_grade" VARCHAR(5),

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "attendance_id" SERIAL NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "attendance_date" DATE NOT NULL,
    "status" VARCHAR(10) NOT NULL,
    "remarks" VARCHAR(255),

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("attendance_id")
);

-- CreateTable
CREATE TABLE "exams" (
    "exam_id" SERIAL NOT NULL,
    "offering_id" INTEGER NOT NULL,
    "exam_type" VARCHAR(10) NOT NULL,
    "exam_date" DATE NOT NULL,
    "max_score" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "exams_pkey" PRIMARY KEY ("exam_id")
);

-- CreateTable
CREATE TABLE "exam_results" (
    "result_id" SERIAL NOT NULL,
    "exam_id" INTEGER NOT NULL,
    "enrollment_id" INTEGER NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "exam_results_pkey" PRIMARY KEY ("result_id")
);

-- CreateTable
CREATE TABLE "posters" (
    "poster_id" SERIAL NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "image_data" BYTEA NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posters_pkey" PRIMARY KEY ("poster_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_department_code_key" ON "departments"("department_code");

-- CreateIndex
CREATE UNIQUE INDEX "students_email_key" ON "students"("email");

-- CreateIndex
CREATE UNIQUE INDEX "students_clerk_user_id_key" ON "students"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_student_number_key" ON "students"("student_number");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_email_key" ON "teachers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_clerk_user_id_key" ON "teachers"("clerk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "teachers_employee_number_key" ON "teachers"("employee_number");

-- CreateIndex
CREATE UNIQUE INDEX "courses_course_code_key" ON "courses"("course_code");

-- CreateIndex
CREATE UNIQUE INDEX "classrooms_room_code_key" ON "classrooms"("room_code");

-- CreateIndex
CREATE UNIQUE INDEX "course_offerings_course_id_semester_id_section_name_key" ON "course_offerings"("course_id", "semester_id", "section_name");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_student_id_offering_id_key" ON "enrollments"("student_id", "offering_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_enrollment_id_attendance_date_key" ON "attendance"("enrollment_id", "attendance_date");

-- CreateIndex
CREATE UNIQUE INDEX "exam_results_exam_id_enrollment_id_key" ON "exam_results"("exam_id", "enrollment_id");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teachers" ADD CONSTRAINT "teachers_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("department_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("teacher_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semesters"("semester_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_offerings" ADD CONSTRAINT "course_offerings_classroom_id_fkey" FOREIGN KEY ("classroom_id") REFERENCES "classrooms"("classroom_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_offering_id_fkey" FOREIGN KEY ("offering_id") REFERENCES "course_offerings"("offering_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("enrollment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exams" ADD CONSTRAINT "exams_offering_id_fkey" FOREIGN KEY ("offering_id") REFERENCES "course_offerings"("offering_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "exams"("exam_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("enrollment_id") ON DELETE CASCADE ON UPDATE CASCADE;
