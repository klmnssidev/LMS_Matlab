-- ============================================================
-- PostgreSQL Schema for adv_db (Vercel Postgres)
-- Migrated from MySQL. Users table removed (replaced by Clerk).
-- Posters table added (images stored as BYTEA).
-- ============================================================

DROP TABLE IF EXISTS exam_results CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS course_offerings CASCADE;
DROP TABLE IF EXISTS classrooms CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS semesters CASCADE;
DROP TABLE IF EXISTS posters CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- ============================================================
-- 1. Departments
-- ============================================================
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    department_code VARCHAR(10) NOT NULL UNIQUE,
    department_name VARCHAR(100) NOT NULL,
    faculty_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. Teachers
-- ============================================================
CREATE TABLE teachers (
    teacher_id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES departments(department_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    teacher_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(30),
    academic_rank VARCHAR(50) NOT NULL,
    hire_date DATE NOT NULL
);

-- ============================================================
-- 3. Students
-- ============================================================
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES departments(department_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    student_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(30),
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    date_of_birth DATE,
    admission_year INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Graduated', 'Suspended', 'Withdrawn'))
);

-- ============================================================
-- 4. Courses
-- ============================================================
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    department_id INTEGER NOT NULL REFERENCES departments(department_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(150) NOT NULL,
    credit_hours INTEGER NOT NULL CHECK (credit_hours BETWEEN 1 AND 6)
);

-- ============================================================
-- 5. Semesters
-- ============================================================
CREATE TABLE semesters (
    semester_id SERIAL PRIMARY KEY,
    semester_name VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- ============================================================
-- 6. Classrooms
-- ============================================================
CREATE TABLE classrooms (
    classroom_id SERIAL PRIMARY KEY,
    room_code VARCHAR(20) NOT NULL UNIQUE,
    building VARCHAR(100) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0)
);

-- ============================================================
-- 7. Course Offerings
-- ============================================================
CREATE TABLE course_offerings (
    offering_id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(course_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    teacher_id INTEGER NOT NULL REFERENCES teachers(teacher_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    semester_id INTEGER NOT NULL REFERENCES semesters(semester_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    classroom_id INTEGER NOT NULL REFERENCES classrooms(classroom_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    section_name VARCHAR(10) NOT NULL DEFAULT 'A',
    max_students INTEGER NOT NULL DEFAULT 40,
    UNIQUE (course_id, semester_id, section_name)
);

-- ============================================================
-- 8. Enrollments
-- ============================================================
CREATE TABLE enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(student_id) ON UPDATE CASCADE ON DELETE CASCADE,
    offering_id INTEGER NOT NULL REFERENCES course_offerings(offering_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    enrollment_date DATE NOT NULL,
    status VARCHAR(10) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Dropped')),
    final_grade VARCHAR(5),
    UNIQUE (student_id, offering_id)
);

-- ============================================================
-- 9. Attendance
-- ============================================================
CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(enrollment_id) ON UPDATE CASCADE ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('Present', 'Absent', 'Late', 'Excused')),
    remarks VARCHAR(255),
    UNIQUE (enrollment_id, attendance_date)
);

-- ============================================================
-- 10. Exams
-- ============================================================
CREATE TABLE exams (
    exam_id SERIAL PRIMARY KEY,
    offering_id INTEGER NOT NULL REFERENCES course_offerings(offering_id) ON UPDATE CASCADE ON DELETE CASCADE,
    exam_type VARCHAR(10) NOT NULL CHECK (exam_type IN ('Quiz', 'Midterm', 'Final', 'Project')),
    exam_date DATE NOT NULL,
    max_score NUMERIC(5,2) NOT NULL
);

-- ============================================================
-- 11. Exam Results
-- ============================================================
CREATE TABLE exam_results (
    result_id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL REFERENCES exams(exam_id) ON UPDATE CASCADE ON DELETE CASCADE,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(enrollment_id) ON UPDATE CASCADE ON DELETE CASCADE,
    score NUMERIC(5,2) NOT NULL,
    UNIQUE (exam_id, enrollment_id)
);

-- ============================================================
-- 12. Posters (images stored as BYTEA)
-- ============================================================
CREATE TABLE posters (
    poster_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    image_data BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF