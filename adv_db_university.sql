-- ============================================================
-- University Database Script for XAMPP / MySQL
-- Database name: adv_db
-- Contains:
--   * 6 departments
--   * 15 teachers
--   * 100 students sample records
--   * Courses, semesters, classrooms, course offerings
--   * Enrollments, attendance, exams, exam results, users
-- Import in phpMyAdmin or run from MySQL command line.
-- ============================================================


CREATE DATABASE adv_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE adv_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS exam_results;
DROP TABLE IF EXISTS exams;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS course_offerings;
DROP TABLE IF EXISTS classrooms;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS semesters;
DROP TABLE IF EXISTS departments;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. Departments
-- ============================================================
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(10) NOT NULL UNIQUE,
    department_name VARCHAR(100) NOT NULL,
    faculty_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. Teachers
-- ============================================================
CREATE TABLE teachers (
    teacher_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    teacher_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(30),
    academic_rank VARCHAR(50) NOT NULL,
    hire_date DATE NOT NULL,
    CONSTRAINT fk_teachers_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. Students
-- ============================================================
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    student_name VARCHAR(120) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    phone VARCHAR(30),
    gender ENUM('Male','Female') NOT NULL,
    date_of_birth DATE,
    admission_year YEAR NOT NULL,
    status ENUM('Active','Graduated','Suspended','Withdrawn') DEFAULT 'Active',
    CONSTRAINT fk_students_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. Courses
-- ============================================================
CREATE TABLE courses (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_name VARCHAR(150) NOT NULL,
    credit_hours INT NOT NULL CHECK (credit_hours BETWEEN 1 AND 6),
    CONSTRAINT fk_courses_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. Semesters
-- ============================================================
CREATE TABLE semesters (
    semester_id INT AUTO_INCREMENT PRIMARY KEY,
    semester_name VARCHAR(50) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. Classrooms
-- ============================================================
CREATE TABLE classrooms (
    classroom_id INT AUTO_INCREMENT PRIMARY KEY,
    room_code VARCHAR(20) NOT NULL UNIQUE,
    building VARCHAR(100) NOT NULL,
    capacity INT NOT NULL CHECK (capacity > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. Course Offerings
-- A course offering means: course + teacher + semester + room + section.
-- ============================================================
CREATE TABLE course_offerings (
    offering_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    teacher_id INT NOT NULL,
    semester_id INT NOT NULL,
    classroom_id INT NOT NULL,
    section_name VARCHAR(10) NOT NULL DEFAULT 'A',
    max_students INT NOT NULL DEFAULT 40,
    CONSTRAINT fk_offerings_course
        FOREIGN KEY (course_id)
        REFERENCES courses(course_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_offerings_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES teachers(teacher_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_offerings_semester
        FOREIGN KEY (semester_id)
        REFERENCES semesters(semester_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_offerings_classroom
        FOREIGN KEY (classroom_id)
        REFERENCES classrooms(classroom_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    UNIQUE KEY uq_course_semester_section (course_id, semester_id, section_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. Enrollments
-- A student can enroll in many course offerings.
-- A course offering can have many students.
-- ============================================================
CREATE TABLE enrollments (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    offering_id INT NOT NULL,
    enrollment_date DATE NOT NULL,
    status ENUM('Active','Completed','Dropped') DEFAULT 'Active',
    final_grade VARCHAR(5),
    CONSTRAINT fk_enrollments_student
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_offering
        FOREIGN KEY (offering_id)
        REFERENCES course_offerings(offering_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    UNIQUE KEY uq_student_offering (student_id, offering_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. Attendance
-- ============================================================
CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    status ENUM('Present','Absent','Late','Excused') NOT NULL,
    remarks VARCHAR(255),
    CONSTRAINT fk_attendance_enrollment
        FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(enrollment_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    UNIQUE KEY uq_enrollment_attendance_date (enrollment_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. Exams
-- ============================================================
CREATE TABLE exams (
    exam_id INT AUTO_INCREMENT PRIMARY KEY,
    offering_id INT NOT NULL,
    exam_type ENUM('Quiz','Midterm','Final','Project') NOT NULL,
    exam_date DATE NOT NULL,
    max_score DECIMAL(5,2) NOT NULL,
    CONSTRAINT fk_exams_offering
        FOREIGN KEY (offering_id)
        REFERENCES course_offerings(offering_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. Exam Results
-- ============================================================
CREATE TABLE exam_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    exam_id INT NOT NULL,
    enrollment_id INT NOT NULL,
    score DECIMAL(5,2) NOT NULL,
    CONSTRAINT fk_results_exam
        FOREIGN KEY (exam_id)
        REFERENCES exams(exam_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT fk_results_enrollment
        FOREIGN KEY (enrollment_id)
        REFERENCES enrollments(enrollment_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    UNIQUE KEY uq_exam_enrollment (exam_id, enrollment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. Users
-- Simple login table for admin, teacher, and student accounts.
-- Password values are sample hashes only.
-- ============================================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin','Teacher','Student') NOT NULL,
    student_id INT NULL,
    teacher_id INT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_student
        FOREIGN KEY (student_id)
        REFERENCES students(student_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT fk_users_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES teachers(teacher_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    CONSTRAINT chk_user_owner CHECK (
        (role = 'Admin' AND student_id IS NULL AND teacher_id IS NULL)
        OR (role = 'Teacher' AND teacher_id IS NOT NULL AND student_id IS NULL)
        OR (role = 'Student' AND student_id IS NOT NULL AND teacher_id IS NULL)
    )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Insert sample data
-- ============================================================

INSERT INTO departments (department_id, department_code, department_name, faculty_name) VALUES
(1, 'CS', 'Computer Science', 'Faculty of Computing'),
(2, 'IT', 'Information Technology', 'Faculty of Computing'),
(3, 'IS', 'Information Systems', 'Faculty of Computing'),
(4, 'SE', 'Software Engineering', 'Faculty of Engineering'),
(5, 'CY', 'Cyber Security', 'Faculty of Computing'),
(6, 'AI', 'Data Science and Artificial Intelligence', 'Faculty of Computing');


INSERT INTO teachers (teacher_id, department_id, teacher_name, email, phone, academic_rank, hire_date) VALUES
(1, 1, 'Dr. Ahmed Hassan', 'ahmed.hassan@university.edu', '+201000000001', 'Professor', '2014-09-01'),
(2, 1, 'Dr. Mona Samir', 'mona.samir@university.edu', '+201000000002', 'Associate Professor', '2016-02-15'),
(3, 2, 'Eng. Khaled Mostafa', 'khaled.mostafa@university.edu', '+201000000003', 'Lecturer', '2018-10-01'),
(4, 2, 'Dr. Sara Ibrahim', 'sara.ibrahim@university.edu', '+201000000004', 'Assistant Professor', '2017-03-10'),
(5, 3, 'Dr. Omar Adel', 'omar.adel@university.edu', '+201000000005', 'Associate Professor', '2015-09-01'),
(6, 3, 'Eng. Nour Ali', 'nour.ali@university.edu', '+201000000006', 'Lecturer', '2020-01-20'),
(7, 4, 'Dr. Youssef Gamal', 'youssef.gamal@university.edu', '+201000000007', 'Professor', '2012-09-01'),
(8, 4, 'Eng. Hany Reda', 'hany.reda@university.edu', '+201000000008', 'Lecturer', '2021-02-01'),
(9, 5, 'Dr. Laila Nabil', 'laila.nabil@university.edu', '+201000000009', 'Assistant Professor', '2019-09-01'),
(10, 5, 'Dr. Tamer Fathy', 'tamer.fathy@university.edu', '+201000000010', 'Associate Professor', '2016-11-11'),
(11, 6, 'Dr. Mariam Farouk', 'mariam.farouk@university.edu', '+201000000011', 'Professor', '2013-09-01'),
(12, 6, 'Eng. Peter George', 'peter.george@university.edu', '+201000000012', 'Lecturer', '2022-09-01'),
(13, 1, 'Dr. Dina Salah', 'dina.salah@university.edu', '+201000000013', 'Assistant Professor', '2018-04-01'),
(14, 2, 'Eng. Karim Wael', 'karim.wael@university.edu', '+201000000014', 'Teaching Assistant', '2023-01-15'),
(15, 4, 'Dr. Reem Ashraf', 'reem.ashraf@university.edu', '+201000000015', 'Assistant Professor', '2020-09-01');


INSERT INTO students (student_id, department_id, student_name, email, phone, gender, date_of_birth, admission_year) VALUES
(1, 1, 'Omar Hassan', 'student001@university.edu', '+20101000001', 'Male', '2007-05-08', 2024),
(2, 2, 'Mariam Ibrahim', 'student002@university.edu', '+20101000002', 'Female', '2007-12-18', 2023),
(3, 3, 'Amr Ali', 'student003@university.edu', '+20101000003', 'Male', '2002-02-07', 2024),
(4, 4, 'Sara Kamal', 'student004@university.edu', '+20101000004', 'Female', '2003-12-21', 2026),
(5, 5, 'Mahmoud Ashraf', 'student005@university.edu', '+20101000005', 'Male', '2006-05-26', 2023),
(6, 6, 'Dina Wael', 'student006@university.edu', '+20101000006', 'Female', '2004-05-05', 2024),
(7, 1, 'Hany Ibrahim', 'student007@university.edu', '+20101000007', 'Male', '2002-07-04', 2025),
(8, 2, 'Yasmin Saad', 'student008@university.edu', '+20101000008', 'Female', '2004-01-24', 2026),
(9, 3, 'Omar Salah', 'student009@university.edu', '+20101000009', 'Male', '2002-09-10', 2025),
(10, 4, 'Reem Samir', 'student010@university.edu', '+20101000010', 'Female', '2002-11-08', 2025),
(11, 5, 'Ali Reda', 'student011@university.edu', '+20101000011', 'Male', '2002-07-09', 2026),
(12, 6, 'Yasmin Adel', 'student012@university.edu', '+20101000012', 'Female', '2004-06-07', 2025),
(13, 1, 'Ali Saad', 'student013@university.edu', '+20101000013', 'Male', '2007-03-18', 2024),
(14, 2, 'Dina Ashraf', 'student014@university.edu', '+20101000014', 'Female', '2005-05-21', 2024),
(15, 3, 'Hany Ali', 'student015@university.edu', '+20101000015', 'Male', '2003-01-26', 2025),
(16, 4, 'Farah Nabil', 'student016@university.edu', '+20101000016', 'Female', '2002-04-19', 2025),
(17, 5, 'Hassan Maher', 'student017@university.edu', '+20101000017', 'Male', '2005-11-15', 2024),
(18, 6, 'Aya Mostafa', 'student018@university.edu', '+20101000018', 'Female', '2003-12-18', 2025),
(19, 1, 'Amr Lotfy', 'student019@university.edu', '+20101000019', 'Male', '2005-06-08', 2024),
(20, 2, 'Mariam Samir', 'student020@university.edu', '+20101000020', 'Female', '2002-02-05', 2024),
(21, 3, 'Amr Saad', 'student021@university.edu', '+20101000021', 'Male', '2002-07-13', 2026),
(22, 4, 'Aya Kamal', 'student022@university.edu', '+20101000022', 'Female', '2002-11-24', 2023),
(23, 5, 'Tamer Farouk', 'student023@university.edu', '+20101000023', 'Male', '2002-05-14', 2024),
(24, 6, 'Mai Hassan', 'student024@university.edu', '+20101000024', 'Female', '2007-12-09', 2024),
(25, 1, 'George Ibrahim', 'student025@university.edu', '+20101000025', 'Male', '2007-05-27', 2024),
(26, 2, 'Mariam George', 'student026@university.edu', '+20101000026', 'Female', '2003-09-25', 2023),
(27, 3, 'Hany Maher', 'student027@university.edu', '+20101000027', 'Male', '2002-02-12', 2025),
(28, 4, 'Hana Ali', 'student028@university.edu', '+20101000028', 'Female', '2003-10-03', 2023),
(29, 5, 'Peter Samir', 'student029@university.edu', '+20101000029', 'Male', '2006-03-05', 2026),
(30, 6, 'Dina Nabil', 'student030@university.edu', '+20101000030', 'Female', '2006-10-14', 2024),
(31, 1, 'Hassan Fathy', 'student031@university.edu', '+20101000031', 'Male', '2005-11-21', 2025),
(32, 2, 'Mai Fawzy', 'student032@university.edu', '+20101000032', 'Female', '2005-02-08', 2024),
(33, 3, 'Ali Farouk', 'student033@university.edu', '+20101000033', 'Male', '2002-10-18', 2024),
(34, 4, 'Hana Hassan', 'student034@university.edu', '+20101000034', 'Female', '2002-12-21', 2023),
(35, 5, 'Mahmoud Samir', 'student035@university.edu', '+20101000035', 'Male', '2002-06-03', 2024),
(36, 6, 'Aya Maher', 'student036@university.edu', '+20101000036', 'Female', '2003-09-05', 2026),
(37, 1, 'Mahmoud Maher', 'student037@university.edu', '+20101000037', 'Male', '2005-04-04', 2023),
(38, 2, 'Rana George', 'student038@university.edu', '+20101000038', 'Female', '2005-07-15', 2023),
(39, 3, 'Omar Ali', 'student039@university.edu', '+20101000039', 'Male', '2005-12-11', 2023),
(40, 4, 'Hana Gamal', 'student040@university.edu', '+20101000040', 'Female', '2003-09-15', 2024),
(41, 5, 'Amr Adel', 'student041@university.edu', '+20101000041', 'Male', '2004-08-08', 2023),
(42, 6, 'Mai Kamal', 'student042@university.edu', '+20101000042', 'Female', '2002-01-21', 2023),
(43, 1, 'Ali Reda', 'student043@university.edu', '+20101000043', 'Male', '2003-07-16', 2026),
(44, 2, 'Reem Salah', 'student044@university.edu', '+20101000044', 'Female', '2002-03-13', 2023),
(45, 3, 'Mostafa Nabil', 'student045@university.edu', '+20101000045', 'Male', '2005-05-14', 2026),
(46, 4, 'Mariam Gamal', 'student046@university.edu', '+20101000046', 'Female', '2004-04-02', 2023),
(47, 5, 'Hany Ali', 'student047@university.edu', '+20101000047', 'Male', '2002-10-16', 2024),
(48, 6, 'Mona Fawzy', 'student048@university.edu', '+20101000048', 'Female', '2002-03-03', 2023),
(49, 1, 'Mahmoud Salah', 'student049@university.edu', '+20101000049', 'Male', '2002-10-08', 2023),
(50, 2, 'Nour Wael', 'student050@university.edu', '+20101000050', 'Female', '2007-10-19', 2025);

INSERT INTO students (student_id, department_id, student_name, email, phone, gender, date_of_birth, admission_year) VALUES
(51, 3, 'Tamer Gamal', 'student051@university.edu', '+20101000051', 'Male', '2007-12-11', 2024),
(52, 4, 'Aya Salah', 'student052@university.edu', '+20101000052', 'Female', '2003-11-21', 2025),
(53, 5, 'Mina Farouk', 'student053@university.edu', '+20101000053', 'Male', '2002-01-15', 2023),
(54, 6, 'Nour Kamal', 'student054@university.edu', '+20101000054', 'Female', '2003-09-09', 2024),
(55, 1, 'Adel Samir', 'student055@university.edu', '+20101000055', 'Male', '2003-06-10', 2024),
(56, 2, 'Mai Kamal', 'student056@university.edu', '+20101000056', 'Female', '2007-05-20', 2023),
(57, 3, 'Karim Ibrahim', 'student057@university.edu', '+20101000057', 'Male', '2003-05-04', 2023),
(58, 4, 'Mariam Nabil', 'student058@university.edu', '+20101000058', 'Female', '2004-10-07', 2025),
(59, 5, 'Hassan Nabil', 'student059@university.edu', '+20101000059', 'Male', '2006-08-09', 2023),
(60, 6, 'Nour Wael', 'student060@university.edu', '+20101000060', 'Female', '2004-01-01', 2025),
(61, 1, 'Youssef Nabil', 'student061@university.edu', '+20101000061', 'Male', '2003-12-15', 2026),
(62, 2, 'Sara Ibrahim', 'student062@university.edu', '+20101000062', 'Female', '2002-12-05', 2023),
(63, 3, 'Adel Lotfy', 'student063@university.edu', '+20101000063', 'Male', '2006-03-14', 2024),
(64, 4, 'Mona Fathy', 'student064@university.edu', '+20101000064', 'Female', '2004-01-12', 2024),
(65, 5, 'Mahmoud Ibrahim', 'student065@university.edu', '+20101000065', 'Male', '2004-09-28', 2026),
(66, 6, 'Mariam Reda', 'student066@university.edu', '+20101000066', 'Female', '2003-03-14', 2023),
(67, 1, 'Khaled Farouk', 'student067@university.edu', '+20101000067', 'Male', '2005-11-28', 2024),
(68, 2, 'Aya Adel', 'student068@university.edu', '+20101000068', 'Female', '2007-02-13', 2023),
(69, 3, 'Peter Reda', 'student069@university.edu', '+20101000069', 'Male', '2003-08-12', 2025),
(70, 4, 'Hana Reda', 'student070@university.edu', '+20101000070', 'Female', '2002-11-07', 2026),
(71, 5, 'Hany Nabil', 'student071@university.edu', '+20101000071', 'Male', '2002-05-12', 2026),
(72, 6, 'Salma Hassan', 'student072@university.edu', '+20101000072', 'Female', '2002-05-06', 2025),
(73, 1, 'Mohamed Ibrahim', 'student073@university.edu', '+20101000073', 'Male', '2006-07-12', 2025),
(74, 2, 'Rana Saad', 'student074@university.edu', '+20101000074', 'Female', '2006-02-13', 2024),
(75, 3, 'Tamer Ali', 'student075@university.edu', '+20101000075', 'Male', '2007-07-01', 2024),
(76, 4, 'Yasmin Wael', 'student076@university.edu', '+20101000076', 'Female', '2002-11-11', 2025),
(77, 5, 'Omar Fathy', 'student077@university.edu', '+20101000077', 'Male', '2006-05-22', 2026),
(78, 6, 'Salma Salah', 'student078@university.edu', '+20101000078', 'Female', '2007-05-18', 2024),
(79, 1, 'Hassan Wael', 'student079@university.edu', '+20101000079', 'Male', '2007-07-22', 2024),
(80, 2, 'Nada Salah', 'student080@university.edu', '+20101000080', 'Female', '2006-01-10', 2025),
(81, 3, 'Hassan Wael', 'student081@university.edu', '+20101000081', 'Male', '2006-10-21', 2025),
(82, 4, 'Mai Ashraf', 'student082@university.edu', '+20101000082', 'Female', '2005-11-07', 2026),
(83, 5, 'Khaled Samir', 'student083@university.edu', '+20101000083', 'Male', '2004-09-22', 2025),
(84, 6, 'Nour Reda', 'student084@university.edu', '+20101000084', 'Female', '2007-05-08', 2024),
(85, 1, 'Youssef Hassan', 'student085@university.edu', '+20101000085', 'Male', '2002-04-16', 2023),
(86, 2, 'Mai Wael', 'student086@university.edu', '+20101000086', 'Female', '2007-10-07', 2026),
(87, 3, 'Peter Salah', 'student087@university.edu', '+20101000087', 'Male', '2003-03-21', 2023),
(88, 4, 'Laila Wael', 'student088@university.edu', '+20101000088', 'Female', '2003-03-26', 2026),
(89, 5, 'Mohamed Kamal', 'student089@university.edu', '+20101000089', 'Male', '2003-02-15', 2024),
(90, 6, 'Mai Fawzy', 'student090@university.edu', '+20101000090', 'Female', '2006-10-11', 2026),
(91, 1, 'George Wael', 'student091@university.edu', '+20101000091', 'Male', '2006-08-06', 2026),
(92, 2, 'Mai Nabil', 'student092@university.edu', '+20101000092', 'Female', '2003-11-09', 2026),
(93, 3, 'Mahmoud Nabil', 'student093@university.edu', '+20101000093', 'Male', '2005-02-23', 2025),
(94, 4, 'Hana Nabil', 'student094@university.edu', '+20101000094', 'Female', '2004-06-18', 2023),
(95, 5, 'Youssef Mostafa', 'student095@university.edu', '+20101000095', 'Male', '2003-07-23', 2024),
(96, 6, 'Reem Samir', 'student096@university.edu', '+20101000096', 'Female', '2005-07-11', 2026),
(97, 1, 'Amr Ali', 'student097@university.edu', '+20101000097', 'Male', '2003-07-13', 2023),
(98, 2, 'Farah Maher', 'student098@university.edu', '+20101000098', 'Female', '2002-06-10', 2026),
(99, 3, 'Amr Kamal', 'student099@university.edu', '+20101000099', 'Male', '2007-12-18', 2024),
(100, 4, 'Mariam Reda', 'student100@university.edu', '+20101000100', 'Female', '2004-07-16', 2023);


INSERT INTO courses (course_id, department_id, course_code, course_name, credit_hours) VALUES
(1, 1, 'CS101', 'Introduction to Programming', 3),
(2, 1, 'CS201', 'Data Structures', 3),
(3, 1, 'CS301', 'Database Systems', 3),
(4, 2, 'IT101', 'Computer Networks', 3),
(5, 2, 'IT202', 'Web Technologies', 3),
(6, 2, 'IT303', 'Cloud Computing', 3),
(7, 3, 'IS101', 'Systems Analysis', 3),
(8, 3, 'IS202', 'Business Information Systems', 3),
(9, 3, 'IS303', 'Enterprise Resource Planning', 3),
(10, 4, 'SE101', 'Software Engineering Principles', 3),
(11, 4, 'SE202', 'Object Oriented Design', 3),
(12, 4, 'SE303', 'Software Testing', 3),
(13, 5, 'CY101', 'Cyber Security Fundamentals', 3),
(14, 5, 'CY202', 'Network Security', 3),
(15, 5, 'CY303', 'Ethical Hacking', 3),
(16, 6, 'AI101', 'Introduction to AI', 3),
(17, 6, 'AI202', 'Machine Learning', 3),
(18, 6, 'AI303', 'Data Mining', 3);


INSERT INTO semesters (semester_id, semester_name, academic_year, start_date, end_date) VALUES
(1, 'Fall 2026', '2026/2027', '2026-09-15', '2027-01-15'),
(2, 'Spring 2027', '2026/2027', '2027-02-10', '2027-06-15');


INSERT INTO classrooms (classroom_id, room_code, building, capacity) VALUES
(1, 'A101', 'Main Building', 40),
(2, 'A102', 'Main Building', 35),
(3, 'B201', 'Engineering Building', 45),
(4, 'B202', 'Engineering Building', 30),
(5, 'LAB1', 'Computer Labs', 25),
(6, 'LAB2', 'Computer Labs', 25);


INSERT INTO course_offerings (offering_id, course_id, teacher_id, semester_id, classroom_id, section_name, max_students) VALUES
(1, 1, 1, 1, 1, 'A', 40),
(2, 2, 2, 2, 2, 'A', 40),
(3, 3, 13, 1, 3, 'A', 40),
(4, 4, 3, 2, 4, 'A', 40),
(5, 5, 4, 1, 5, 'A', 40),
(6, 6, 14, 2, 6, 'A', 40),
(7, 7, 5, 1, 1, 'A', 40),
(8, 8, 6, 2, 2, 'A', 40),
(9, 9, 5, 1, 3, 'A', 40),
(10, 10, 7, 2, 4, 'A', 40),
(11, 11, 8, 1, 5, 'A', 40),
(12, 12, 15, 2, 6, 'A', 40),
(13, 13, 9, 1, 1, 'A', 40),
(14, 14, 10, 2, 2, 'A', 40),
(15, 15, 9, 1, 3, 'A', 40),
(16, 16, 12, 2, 4, 'A', 40),
(17, 17, 11, 1, 5, 'A', 40),
(18, 18, 12, 2, 6, 'A', 40);


INSERT INTO enrollments (enrollment_id, student_id, offering_id, enrollment_date, status, final_grade) VALUES
(1, 1, 1, '2026-09-03', 'Active', 'F'),
(2, 1, 2, '2027-02-04', 'Active', 'D'),
(3, 1, 3, '2026-09-05', 'Active', 'F'),
(4, 2, 4, '2027-02-07', 'Active', 'B'),
(5, 2, 5, '2026-09-08', 'Active', NULL),
(6, 2, 6, '2027-02-09', 'Active', 'B'),
(7, 3, 7, '2026-09-11', 'Active', 'A'),
(8, 3, 8, '2027-02-12', 'Active', 'F'),
(9, 3, 9, '2026-09-13', 'Active', 'A'),
(10, 4, 10, '2027-02-15', 'Active', 'B+'),
(11, 4, 11, '2026-09-16', 'Active', 'F'),
(12, 4, 12, '2027-02-17', 'Active', 'B'),
(13, 5, 13, '2026-09-19', 'Active', NULL),
(14, 5, 14, '2027-02-20', 'Active', 'B'),
(15, 5, 15, '2026-09-01', 'Active', 'A'),
(16, 6, 16, '2027-02-03', 'Active', 'C'),
(17, 6, 17, '2026-09-04', 'Active', 'F'),
(18, 6, 18, '2027-02-05', 'Active', 'D'),
(19, 7, 1, '2026-09-09', 'Active', 'C+'),
(20, 7, 2, '2027-02-10', 'Active', NULL),
(21, 7, 3, '2026-09-11', 'Active', 'D'),
(22, 8, 4, '2027-02-13', 'Active', 'D'),
(23, 8, 5, '2026-09-14', 'Active', 'F'),
(24, 8, 6, '2027-02-15', 'Active', 'C'),
(25, 9, 7, '2026-09-17', 'Active', 'F'),
(26, 9, 8, '2027-02-18', 'Active', 'C'),
(27, 9, 9, '2026-09-19', 'Active', 'B+'),
(28, 10, 10, '2027-02-01', 'Active', NULL),
(29, 10, 11, '2026-09-02', 'Active', 'A'),
(30, 10, 12, '2027-02-03', 'Active', 'A'),
(31, 11, 13, '2026-09-05', 'Active', 'D'),
(32, 11, 14, '2027-02-06', 'Active', 'C+'),
(33, 11, 15, '2026-09-07', 'Active', 'B+'),
(34, 12, 16, '2027-02-09', 'Active', 'A'),
(35, 12, 17, '2026-09-10', 'Active', 'A'),
(36, 12, 18, '2027-02-11', 'Active', 'C+'),
(37, 13, 1, '2026-09-15', 'Active', 'C+'),
(38, 13, 2, '2027-02-16', 'Active', 'A'),
(39, 13, 3, '2026-09-17', 'Active', 'B'),
(40, 14, 4, '2027-02-19', 'Active', 'C+'),
(41, 14, 5, '2026-09-20', 'Active', 'B'),
(42, 14, 6, '2027-02-01', 'Active', NULL),
(43, 15, 7, '2026-09-03', 'Active', 'B+'),
(44, 15, 8, '2027-02-04', 'Active', 'C+'),
(45, 15, 9, '2026-09-05', 'Active', NULL),
(46, 16, 10, '2027-02-07', 'Active', 'C'),
(47, 16, 11, '2026-09-08', 'Active', 'D'),
(48, 16, 12, '2027-02-09', 'Active', 'B'),
(49, 17, 13, '2026-09-11', 'Active', 'B+'),
(50, 17, 14, '2027-02-12', 'Active', 'B'),
(51, 17, 15, '2026-09-13', 'Active', 'C'),
(52, 18, 16, '2027-02-15', 'Active', 'B+'),
(53, 18, 17, '2026-09-16', 'Active', 'A'),
(54, 18, 18, '2027-02-17', 'Active', 'C'),
(55, 19, 1, '2026-09-01', 'Active', 'F'),
(56, 19, 2, '2027-02-02', 'Active', 'F'),
(57, 19, 3, '2026-09-03', 'Active', 'C+'),
(58, 20, 4, '2027-02-05', 'Active', 'B+'),
(59, 20, 5, '2026-09-06', 'Active', 'C+'),
(60, 20, 6, '2027-02-07', 'Active', 'B+'),
(61, 21, 7, '2026-09-09', 'Active', 'C'),
(62, 21, 8, '2027-02-10', 'Active', 'B+'),
(63, 21, 9, '2026-09-11', 'Active', 'A'),
(64, 22, 10, '2027-02-13', 'Active', 'D'),
(65, 22, 11, '2026-09-14', 'Active', 'F'),
(66, 22, 12, '2027-02-15', 'Active', 'D'),
(67, 23, 13, '2026-09-17', 'Active', 'B+'),
(68, 23, 14, '2027-02-18', 'Active', 'D'),
(69, 23, 15, '2026-09-19', 'Active', 'A'),
(70, 24, 16, '2027-02-01', 'Active', 'F'),
(71, 24, 17, '2026-09-02', 'Active', NULL),
(72, 24, 18, '2027-02-03', 'Active', 'B+'),
(73, 25, 1, '2026-09-07', 'Active', 'F'),
(74, 25, 2, '2027-02-08', 'Active', 'D'),
(75, 25, 3, '2026-09-09', 'Active', NULL),
(76, 26, 4, '2027-02-11', 'Active', 'B'),
(77, 26, 5, '2026-09-12', 'Active', 'F'),
(78, 26, 6, '2027-02-13', 'Active', 'B'),
(79, 27, 7, '2026-09-15', 'Active', 'C'),
(80, 27, 8, '2027-02-16', 'Active', NULL),
(81, 27, 9, '2026-09-17', 'Active', NULL),
(82, 28, 10, '2027-02-19', 'Active', 'F'),
(83, 28, 11, '2026-09-20', 'Active', 'C'),
(84, 28, 12, '2027-02-01', 'Active', 'D'),
(85, 29, 13, '2026-09-03', 'Active', 'C+'),
(86, 29, 14, '2027-02-04', 'Active', 'B+'),
(87, 29, 15, '2026-09-05', 'Active', 'C'),
(88, 30, 16, '2027-02-07', 'Active', NULL),
(89, 30, 17, '2026-09-08', 'Active', 'C+'),
(90, 30, 18, '2027-02-09', 'Active', NULL),
(91, 31, 1, '2026-09-13', 'Active', 'F'),
(92, 31, 2, '2027-02-14', 'Active', 'D'),
(93, 31, 3, '2026-09-15', 'Active', 'A'),
(94, 32, 4, '2027-02-17', 'Active', NULL),
(95, 32, 5, '2026-09-18', 'Active', 'D'),
(96, 32, 6, '2027-02-19', 'Active', 'B'),
(97, 33, 7, '2026-09-01', 'Active', NULL),
(98, 33, 8, '2027-02-02', 'Active', 'C+'),
(99, 33, 9, '2026-09-03', 'Active', 'D'),
(100, 34, 10, '2027-02-05', 'Active', 'C');

INSERT INTO enrollments (enrollment_id, student_id, offering_id, enrollment_date, status, final_grade) VALUES
(101, 34, 11, '2026-09-06', 'Active', 'D'),
(102, 34, 12, '2027-02-07', 'Active', 'C'),
(103, 35, 13, '2026-09-09', 'Active', 'C'),
(104, 35, 14, '2027-02-10', 'Active', 'A'),
(105, 35, 15, '2026-09-11', 'Active', 'C+'),
(106, 36, 16, '2027-02-13', 'Active', 'B+'),
(107, 36, 17, '2026-09-14', 'Active', 'C+'),
(108, 36, 18, '2027-02-15', 'Active', 'F'),
(109, 37, 1, '2026-09-19', 'Active', NULL),
(110, 37, 2, '2027-02-20', 'Active', 'C+'),
(111, 37, 3, '2026-09-01', 'Active', NULL),
(112, 38, 4, '2027-02-03', 'Active', NULL),
(113, 38, 5, '2026-09-04', 'Active', NULL),
(114, 38, 6, '2027-02-05', 'Active', 'A'),
(115, 39, 7, '2026-09-07', 'Active', 'B+'),
(116, 39, 8, '2027-02-08', 'Active', 'C'),
(117, 39, 9, '2026-09-09', 'Active', 'C+'),
(118, 40, 10, '2027-02-11', 'Active', 'F'),
(119, 40, 11, '2026-09-12', 'Active', 'C+'),
(120, 40, 12, '2027-02-13', 'Active', 'C'),
(121, 41, 13, '2026-09-15', 'Active', 'D'),
(122, 41, 14, '2027-02-16', 'Active', NULL),
(123, 41, 15, '2026-09-17', 'Active', 'D'),
(124, 42, 16, '2027-02-19', 'Active', 'F'),
(125, 42, 17, '2026-09-20', 'Active', 'D'),
(126, 42, 18, '2027-02-01', 'Active', 'D'),
(127, 43, 1, '2026-09-05', 'Active', NULL),
(128, 43, 2, '2027-02-06', 'Active', 'C'),
(129, 43, 3, '2026-09-07', 'Active', 'C'),
(130, 44, 4, '2027-02-09', 'Active', 'C'),
(131, 44, 5, '2026-09-10', 'Active', 'C+'),
(132, 44, 6, '2027-02-11', 'Active', 'B+'),
(133, 45, 7, '2026-09-13', 'Active', 'C+'),
(134, 45, 8, '2027-02-14', 'Active', 'D'),
(135, 45, 9, '2026-09-15', 'Active', 'B+'),
(136, 46, 10, '2027-02-17', 'Active', 'B'),
(137, 46, 11, '2026-09-18', 'Active', 'C+'),
(138, 46, 12, '2027-02-19', 'Active', 'C+'),
(139, 47, 13, '2026-09-01', 'Active', NULL),
(140, 47, 14, '2027-02-02', 'Active', 'C'),
(141, 47, 15, '2026-09-03', 'Active', 'C'),
(142, 48, 16, '2027-02-05', 'Active', 'B+'),
(143, 48, 17, '2026-09-06', 'Active', 'C+'),
(144, 48, 18, '2027-02-07', 'Active', 'C'),
(145, 49, 1, '2026-09-11', 'Active', 'C+'),
(146, 49, 2, '2027-02-12', 'Active', 'D'),
(147, 49, 3, '2026-09-13', 'Active', 'B'),
(148, 50, 4, '2027-02-15', 'Active', 'C'),
(149, 50, 5, '2026-09-16', 'Active', 'A'),
(150, 50, 6, '2027-02-17', 'Active', 'B'),
(151, 51, 7, '2026-09-19', 'Active', 'C'),
(152, 51, 8, '2027-02-20', 'Active', 'A'),
(153, 51, 9, '2026-09-01', 'Active', 'A'),
(154, 52, 10, '2027-02-03', 'Active', 'C'),
(155, 52, 11, '2026-09-04', 'Active', 'B'),
(156, 52, 12, '2027-02-05', 'Active', NULL),
(157, 53, 13, '2026-09-07', 'Active', 'B+'),
(158, 53, 14, '2027-02-08', 'Active', 'A'),
(159, 53, 15, '2026-09-09', 'Active', 'C'),
(160, 54, 16, '2027-02-11', 'Active', NULL),
(161, 54, 17, '2026-09-12', 'Active', NULL),
(162, 54, 18, '2027-02-13', 'Active', NULL),
(163, 55, 1, '2026-09-17', 'Active', 'D'),
(164, 55, 2, '2027-02-18', 'Active', 'B'),
(165, 55, 3, '2026-09-19', 'Active', 'A'),
(166, 56, 4, '2027-02-01', 'Active', 'C'),
(167, 56, 5, '2026-09-02', 'Active', NULL),
(168, 56, 6, '2027-02-03', 'Active', 'B+'),
(169, 57, 7, '2026-09-05', 'Active', 'B+'),
(170, 57, 8, '2027-02-06', 'Active', 'F'),
(171, 57, 9, '2026-09-07', 'Active', NULL),
(172, 58, 10, '2027-02-09', 'Active', 'B+'),
(173, 58, 11, '2026-09-10', 'Active', 'A'),
(174, 58, 12, '2027-02-11', 'Active', 'B'),
(175, 59, 13, '2026-09-13', 'Active', 'B'),
(176, 59, 14, '2027-02-14', 'Active', 'C'),
(177, 59, 15, '2026-09-15', 'Active', 'B+'),
(178, 60, 16, '2027-02-17', 'Active', 'C+'),
(179, 60, 17, '2026-09-18', 'Active', 'B+'),
(180, 60, 18, '2027-02-19', 'Active', 'F'),
(181, 61, 1, '2026-09-03', 'Active', 'C+'),
(182, 61, 2, '2027-02-04', 'Active', 'F'),
(183, 61, 3, '2026-09-05', 'Active', NULL),
(184, 62, 4, '2027-02-07', 'Active', NULL),
(185, 62, 5, '2026-09-08', 'Active', 'C'),
(186, 62, 6, '2027-02-09', 'Active', 'F'),
(187, 63, 7, '2026-09-11', 'Active', 'C'),
(188, 63, 8, '2027-02-12', 'Active', 'A'),
(189, 63, 9, '2026-09-13', 'Active', 'B+'),
(190, 64, 10, '2027-02-15', 'Active', 'C+'),
(191, 64, 11, '2026-09-16', 'Active', 'C+'),
(192, 64, 12, '2027-02-17', 'Active', 'C'),
(193, 65, 13, '2026-09-19', 'Active', 'B+'),
(194, 65, 14, '2027-02-20', 'Active', 'B'),
(195, 65, 15, '2026-09-01', 'Active', 'C+'),
(196, 66, 16, '2027-02-03', 'Active', 'B'),
(197, 66, 17, '2026-09-04', 'Active', 'B+'),
(198, 66, 18, '2027-02-05', 'Active', 'B'),
(199, 67, 1, '2026-09-09', 'Active', 'A'),
(200, 67, 2, '2027-02-10', 'Active', 'F');

INSERT INTO enrollments (enrollment_id, student_id, offering_id, enrollment_date, status, final_grade) VALUES
(201, 67, 3, '2026-09-11', 'Active', NULL),
(202, 68, 4, '2027-02-13', 'Active', NULL),
(203, 68, 5, '2026-09-14', 'Active', 'C'),
(204, 68, 6, '2027-02-15', 'Active', 'A'),
(205, 69, 7, '2026-09-17', 'Active', 'C+'),
(206, 69, 8, '2027-02-18', 'Active', 'C'),
(207, 69, 9, '2026-09-19', 'Active', 'C'),
(208, 70, 10, '2027-02-01', 'Active', NULL),
(209, 70, 11, '2026-09-02', 'Active', 'B+'),
(210, 70, 12, '2027-02-03', 'Active', 'C+'),
(211, 71, 13, '2026-09-05', 'Active', 'C'),
(212, 71, 14, '2027-02-06', 'Active', 'C+'),
(213, 71, 15, '2026-09-07', 'Active', 'F'),
(214, 72, 16, '2027-02-09', 'Active', 'B+'),
(215, 72, 17, '2026-09-10', 'Active', 'C+'),
(216, 72, 18, '2027-02-11', 'Active', 'B'),
(217, 73, 1, '2026-09-15', 'Active', 'C'),
(218, 73, 2, '2027-02-16', 'Active', 'B'),
(219, 73, 3, '2026-09-17', 'Active', 'B+'),
(220, 74, 4, '2027-02-19', 'Active', 'A'),
(221, 74, 5, '2026-09-20', 'Active', 'B'),
(222, 74, 6, '2027-02-01', 'Active', 'C'),
(223, 75, 7, '2026-09-03', 'Active', 'C'),
(224, 75, 8, '2027-02-04', 'Active', NULL),
(225, 75, 9, '2026-09-05', 'Active', 'B+'),
(226, 76, 10, '2027-02-07', 'Active', NULL),
(227, 76, 11, '2026-09-08', 'Active', 'C'),
(228, 76, 12, '2027-02-09', 'Active', 'F'),
(229, 77, 13, '2026-09-11', 'Active', 'C'),
(230, 77, 14, '2027-02-12', 'Active', NULL),
(231, 77, 15, '2026-09-13', 'Active', NULL),
(232, 78, 16, '2027-02-15', 'Active', 'B+'),
(233, 78, 17, '2026-09-16', 'Active', 'A'),
(234, 78, 18, '2027-02-17', 'Active', 'F'),
(235, 79, 1, '2026-09-01', 'Active', 'D'),
(236, 79, 2, '2027-02-02', 'Active', 'C'),
(237, 79, 3, '2026-09-03', 'Active', 'A'),
(238, 80, 4, '2027-02-05', 'Active', 'B+'),
(239, 80, 5, '2026-09-06', 'Active', 'C+'),
(240, 80, 6, '2027-02-07', 'Active', 'A'),
(241, 81, 7, '2026-09-09', 'Active', 'C'),
(242, 81, 8, '2027-02-10', 'Active', 'A'),
(243, 81, 9, '2026-09-11', 'Active', 'B'),
(244, 82, 10, '2027-02-13', 'Active', NULL),
(245, 82, 11, '2026-09-14', 'Active', NULL),
(246, 82, 12, '2027-02-15', 'Active', 'C'),
(247, 83, 13, '2026-09-17', 'Active', 'B'),
(248, 83, 14, '2027-02-18', 'Active', 'F'),
(249, 83, 15, '2026-09-19', 'Active', NULL),
(250, 84, 16, '2027-02-01', 'Active', 'B+'),
(251, 84, 17, '2026-09-02', 'Active', NULL),
(252, 84, 18, '2027-02-03', 'Active', 'D'),
(253, 85, 1, '2026-09-07', 'Active', 'F'),
(254, 85, 2, '2027-02-08', 'Active', 'D'),
(255, 85, 3, '2026-09-09', 'Active', 'D'),
(256, 86, 4, '2027-02-11', 'Active', 'B+'),
(257, 86, 5, '2026-09-12', 'Active', 'B'),
(258, 86, 6, '2027-02-13', 'Active', 'D'),
(259, 87, 7, '2026-09-15', 'Active', 'F'),
(260, 87, 8, '2027-02-16', 'Active', NULL),
(261, 87, 9, '2026-09-17', 'Active', 'C'),
(262, 88, 10, '2027-02-19', 'Active', 'F'),
(263, 88, 11, '2026-09-20', 'Active', 'A'),
(264, 88, 12, '2027-02-01', 'Active', NULL),
(265, 89, 13, '2026-09-03', 'Active', 'B+'),
(266, 89, 14, '2027-02-04', 'Active', 'D'),
(267, 89, 15, '2026-09-05', 'Active', 'C'),
(268, 90, 16, '2027-02-07', 'Active', 'D'),
(269, 90, 17, '2026-09-08', 'Active', 'B+'),
(270, 90, 18, '2027-02-09', 'Active', 'F'),
(271, 91, 1, '2026-09-13', 'Active', 'A'),
(272, 91, 2, '2027-02-14', 'Active', NULL),
(273, 91, 3, '2026-09-15', 'Active', 'F'),
(274, 92, 4, '2027-02-17', 'Active', 'A'),
(275, 92, 5, '2026-09-18', 'Active', 'C+'),
(276, 92, 6, '2027-02-19', 'Active', 'D'),
(277, 93, 7, '2026-09-01', 'Active', NULL),
(278, 93, 8, '2027-02-02', 'Active', NULL),
(279, 93, 9, '2026-09-03', 'Active', 'A'),
(280, 94, 10, '2027-02-05', 'Active', 'C+'),
(281, 94, 11, '2026-09-06', 'Active', 'C'),
(282, 94, 12, '2027-02-07', 'Active', 'B'),
(283, 95, 13, '2026-09-09', 'Active', 'C'),
(284, 95, 14, '2027-02-10', 'Active', NULL),
(285, 95, 15, '2026-09-11', 'Active', NULL),
(286, 96, 16, '2027-02-13', 'Active', 'B+'),
(287, 96, 17, '2026-09-14', 'Active', 'A'),
(288, 96, 18, '2027-02-15', 'Active', 'C+'),
(289, 97, 1, '2026-09-19', 'Active', 'B'),
(290, 97, 2, '2027-02-20', 'Active', 'C'),
(291, 97, 3, '2026-09-01', 'Active', 'A'),
(292, 98, 4, '2027-02-03', 'Active', 'F'),
(293, 98, 5, '2026-09-04', 'Active', 'B+'),
(294, 98, 6, '2027-02-05', 'Active', 'C+'),
(295, 99, 7, '2026-09-07', 'Active', 'B+'),
(296, 99, 8, '2027-02-08', 'Active', NULL),
(297, 99, 9, '2026-09-09', 'Active', 'B+'),
(298, 100, 10, '2027-02-11', 'Active', 'B'),
(299, 100, 11, '2026-09-12', 'Active', NULL),
(300, 100, 12, '2027-02-13', 'Active', 'C');


INSERT INTO attendance (attendance_id, enrollment_id, attendance_date, status, remarks) VALUES
(1, 1, '2026-10-02', 'Present', 'Sample attendance record'),
(2, 1, '2026-10-09', 'Late', 'Sample attendance record'),
(3, 2, '2027-03-03', 'Absent', 'Sample attendance record'),
(4, 2, '2027-03-10', 'Late', 'Sample attendance record'),
(5, 3, '2026-10-04', 'Present', 'Sample attendance record'),
(6, 3, '2026-10-11', 'Absent', 'Sample attendance record'),
(7, 4, '2027-03-05', 'Present', 'Sample attendance record'),
(8, 4, '2027-03-12', 'Absent', 'Sample attendance record'),
(9, 5, '2026-10-01', 'Late', 'Sample attendance record'),
(10, 5, '2026-10-08', 'Absent', 'Sample attendance record'),
(11, 6, '2027-03-02', 'Present', 'Sample attendance record'),
(12, 6, '2027-03-09', 'Present', 'Sample attendance record'),
(13, 7, '2026-10-03', 'Present', 'Sample attendance record'),
(14, 7, '2026-10-10', 'Present', 'Sample attendance record'),
(15, 8, '2027-03-04', 'Absent', 'Sample attendance record'),
(16, 8, '2027-03-11', 'Absent', 'Sample attendance record'),
(17, 9, '2026-10-05', 'Present', 'Sample attendance record'),
(18, 9, '2026-10-12', 'Present', 'Sample attendance record'),
(19, 10, '2027-03-01', 'Present', 'Sample attendance record'),
(20, 10, '2027-03-08', 'Present', 'Sample attendance record'),
(21, 11, '2026-10-02', 'Late', 'Sample attendance record'),
(22, 11, '2026-10-09', 'Present', 'Sample attendance record'),
(23, 12, '2027-03-03', 'Present', 'Sample attendance record'),
(24, 12, '2027-03-10', 'Absent', 'Sample attendance record'),
(25, 13, '2026-10-04', 'Present', 'Sample attendance record'),
(26, 13, '2026-10-11', 'Present', 'Sample attendance record'),
(27, 14, '2027-03-05', 'Present', 'Sample attendance record'),
(28, 14, '2027-03-12', 'Absent', 'Sample attendance record'),
(29, 15, '2026-10-01', 'Present', 'Sample attendance record'),
(30, 15, '2026-10-08', 'Present', 'Sample attendance record'),
(31, 16, '2027-03-02', 'Late', 'Sample attendance record'),
(32, 16, '2027-03-09', 'Present', 'Sample attendance record'),
(33, 17, '2026-10-03', 'Present', 'Sample attendance record'),
(34, 17, '2026-10-10', 'Present', 'Sample attendance record'),
(35, 18, '2027-03-04', 'Present', 'Sample attendance record'),
(36, 18, '2027-03-11', 'Present', 'Sample attendance record'),
(37, 19, '2026-10-05', 'Late', 'Sample attendance record'),
(38, 19, '2026-10-12', 'Present', 'Sample attendance record'),
(39, 20, '2027-03-01', 'Present', 'Sample attendance record'),
(40, 20, '2027-03-08', 'Late', 'Sample attendance record'),
(41, 21, '2026-10-02', 'Present', 'Sample attendance record'),
(42, 21, '2026-10-09', 'Late', 'Sample attendance record'),
(43, 22, '2027-03-03', 'Present', 'Sample attendance record'),
(44, 22, '2027-03-10', 'Present', 'Sample attendance record'),
(45, 23, '2026-10-04', 'Present', 'Sample attendance record'),
(46, 23, '2026-10-11', 'Present', 'Sample attendance record'),
(47, 24, '2027-03-05', 'Late', 'Sample attendance record'),
(48, 24, '2027-03-12', 'Present', 'Sample attendance record'),
(49, 25, '2026-10-01', 'Present', 'Sample attendance record'),
(50, 25, '2026-10-08', 'Present', 'Sample attendance record'),
(51, 26, '2027-03-02', 'Present', 'Sample attendance record'),
(52, 26, '2027-03-09', 'Late', 'Sample attendance record'),
(53, 27, '2026-10-03', 'Present', 'Sample attendance record'),
(54, 27, '2026-10-10', 'Present', 'Sample attendance record'),
(55, 28, '2027-03-04', 'Present', 'Sample attendance record'),
(56, 28, '2027-03-11', 'Present', 'Sample attendance record'),
(57, 29, '2026-10-05', 'Present', 'Sample attendance record'),
(58, 29, '2026-10-12', 'Present', 'Sample attendance record'),
(59, 30, '2027-03-01', 'Present', 'Sample attendance record'),
(60, 30, '2027-03-08', 'Present', 'Sample attendance record'),
(61, 31, '2026-10-02', 'Late', 'Sample attendance record'),
(62, 31, '2026-10-09', 'Present', 'Sample attendance record'),
(63, 32, '2027-03-03', 'Present', 'Sample attendance record'),
(64, 32, '2027-03-10', 'Present', 'Sample attendance record'),
(65, 33, '2026-10-04', 'Present', 'Sample attendance record'),
(66, 33, '2026-10-11', 'Present', 'Sample attendance record'),
(67, 34, '2027-03-05', 'Present', 'Sample attendance record'),
(68, 34, '2027-03-12', 'Absent', 'Sample attendance record'),
(69, 35, '2026-10-01', 'Late', 'Sample attendance record'),
(70, 35, '2026-10-08', 'Present', 'Sample attendance record'),
(71, 36, '2027-03-02', 'Present', 'Sample attendance record'),
(72, 36, '2027-03-09', 'Absent', 'Sample attendance record'),
(73, 37, '2026-10-03', 'Absent', 'Sample attendance record'),
(74, 37, '2026-10-10', 'Present', 'Sample attendance record'),
(75, 38, '2027-03-04', 'Late', 'Sample attendance record'),
(76, 38, '2027-03-11', 'Late', 'Sample attendance record'),
(77, 39, '2026-10-05', 'Present', 'Sample attendance record'),
(78, 39, '2026-10-12', 'Absent', 'Sample attendance record'),
(79, 40, '2027-03-01', 'Late', 'Sample attendance record'),
(80, 40, '2027-03-08', 'Present', 'Sample attendance record'),
(81, 41, '2026-10-02', 'Late', 'Sample attendance record'),
(82, 41, '2026-10-09', 'Present', 'Sample attendance record'),
(83, 42, '2027-03-03', 'Late', 'Sample attendance record'),
(84, 42, '2027-03-10', 'Present', 'Sample attendance record'),
(85, 43, '2026-10-04', 'Absent', 'Sample attendance record'),
(86, 43, '2026-10-11', 'Present', 'Sample attendance record'),
(87, 44, '2027-03-05', 'Present', 'Sample attendance record'),
(88, 44, '2027-03-12', 'Absent', 'Sample attendance record'),
(89, 45, '2026-10-01', 'Absent', 'Sample attendance record'),
(90, 45, '2026-10-08', 'Absent', 'Sample attendance record'),
(91, 46, '2027-03-02', 'Present', 'Sample attendance record'),
(92, 46, '2027-03-09', 'Absent', 'Sample attendance record'),
(93, 47, '2026-10-03', 'Absent', 'Sample attendance record'),
(94, 47, '2026-10-10', 'Present', 'Sample attendance record'),
(95, 48, '2027-03-04', 'Present', 'Sample attendance record'),
(96, 48, '2027-03-11', 'Present', 'Sample attendance record'),
(97, 49, '2026-10-05', 'Late', 'Sample attendance record'),
(98, 49, '2026-10-12', 'Present', 'Sample attendance record'),
(99, 50, '2027-03-01', 'Present', 'Sample attendance record'),
(100, 50, '2027-03-08', 'Present', 'Sample attendance record');

INSERT INTO attendance (attendance_id, enrollment_id, attendance_date, status, remarks) VALUES
(101, 51, '2026-10-02', 'Present', 'Sample attendance record'),
(102, 51, '2026-10-09', 'Late', 'Sample attendance record'),
(103, 52, '2027-03-03', 'Late', 'Sample attendance record'),
(104, 52, '2027-03-10', 'Late', 'Sample attendance record'),
(105, 53, '2026-10-04', 'Present', 'Sample attendance record'),
(106, 53, '2026-10-11', 'Absent', 'Sample attendance record'),
(107, 54, '2027-03-05', 'Late', 'Sample attendance record'),
(108, 54, '2027-03-12', 'Late', 'Sample attendance record'),
(109, 55, '2026-10-01', 'Present', 'Sample attendance record'),
(110, 55, '2026-10-08', 'Absent', 'Sample attendance record'),
(111, 56, '2027-03-02', 'Late', 'Sample attendance record'),
(112, 56, '2027-03-09', 'Late', 'Sample attendance record'),
(113, 57, '2026-10-03', 'Absent', 'Sample attendance record'),
(114, 57, '2026-10-10', 'Present', 'Sample attendance record'),
(115, 58, '2027-03-04', 'Present', 'Sample attendance record'),
(116, 58, '2027-03-11', 'Late', 'Sample attendance record'),
(117, 59, '2026-10-05', 'Present', 'Sample attendance record'),
(118, 59, '2026-10-12', 'Absent', 'Sample attendance record'),
(119, 60, '2027-03-01', 'Absent', 'Sample attendance record'),
(120, 60, '2027-03-08', 'Present', 'Sample attendance record'),
(121, 61, '2026-10-02', 'Absent', 'Sample attendance record'),
(122, 61, '2026-10-09', 'Present', 'Sample attendance record'),
(123, 62, '2027-03-03', 'Absent', 'Sample attendance record'),
(124, 62, '2027-03-10', 'Absent', 'Sample attendance record'),
(125, 63, '2026-10-04', 'Absent', 'Sample attendance record'),
(126, 63, '2026-10-11', 'Present', 'Sample attendance record'),
(127, 64, '2027-03-05', 'Present', 'Sample attendance record'),
(128, 64, '2027-03-12', 'Absent', 'Sample attendance record'),
(129, 65, '2026-10-01', 'Present', 'Sample attendance record'),
(130, 65, '2026-10-08', 'Present', 'Sample attendance record'),
(131, 66, '2027-03-02', 'Present', 'Sample attendance record'),
(132, 66, '2027-03-09', 'Present', 'Sample attendance record'),
(133, 67, '2026-10-03', 'Absent', 'Sample attendance record'),
(134, 67, '2026-10-10', 'Present', 'Sample attendance record'),
(135, 68, '2027-03-04', 'Present', 'Sample attendance record'),
(136, 68, '2027-03-11', 'Present', 'Sample attendance record'),
(137, 69, '2026-10-05', 'Present', 'Sample attendance record'),
(138, 69, '2026-10-12', 'Absent', 'Sample attendance record'),
(139, 70, '2027-03-01', 'Present', 'Sample attendance record'),
(140, 70, '2027-03-08', 'Present', 'Sample attendance record'),
(141, 71, '2026-10-02', 'Present', 'Sample attendance record'),
(142, 71, '2026-10-09', 'Late', 'Sample attendance record'),
(143, 72, '2027-03-03', 'Present', 'Sample attendance record'),
(144, 72, '2027-03-10', 'Late', 'Sample attendance record'),
(145, 73, '2026-10-04', 'Late', 'Sample attendance record'),
(146, 73, '2026-10-11', 'Late', 'Sample attendance record'),
(147, 74, '2027-03-05', 'Present', 'Sample attendance record'),
(148, 74, '2027-03-12', 'Present', 'Sample attendance record'),
(149, 75, '2026-10-01', 'Absent', 'Sample attendance record'),
(150, 75, '2026-10-08', 'Present', 'Sample attendance record'),
(151, 76, '2027-03-02', 'Absent', 'Sample attendance record'),
(152, 76, '2027-03-09', 'Present', 'Sample attendance record'),
(153, 77, '2026-10-03', 'Present', 'Sample attendance record'),
(154, 77, '2026-10-10', 'Late', 'Sample attendance record'),
(155, 78, '2027-03-04', 'Present', 'Sample attendance record'),
(156, 78, '2027-03-11', 'Present', 'Sample attendance record'),
(157, 79, '2026-10-05', 'Present', 'Sample attendance record'),
(158, 79, '2026-10-12', 'Late', 'Sample attendance record'),
(159, 80, '2027-03-01', 'Late', 'Sample attendance record'),
(160, 80, '2027-03-08', 'Present', 'Sample attendance record'),
(161, 81, '2026-10-02', 'Present', 'Sample attendance record'),
(162, 81, '2026-10-09', 'Absent', 'Sample attendance record'),
(163, 82, '2027-03-03', 'Present', 'Sample attendance record'),
(164, 82, '2027-03-10', 'Present', 'Sample attendance record'),
(165, 83, '2026-10-04', 'Present', 'Sample attendance record'),
(166, 83, '2026-10-11', 'Late', 'Sample attendance record'),
(167, 84, '2027-03-05', 'Present', 'Sample attendance record'),
(168, 84, '2027-03-12', 'Present', 'Sample attendance record'),
(169, 85, '2026-10-01', 'Present', 'Sample attendance record'),
(170, 85, '2026-10-08', 'Late', 'Sample attendance record'),
(171, 86, '2027-03-02', 'Present', 'Sample attendance record'),
(172, 86, '2027-03-09', 'Absent', 'Sample attendance record'),
(173, 87, '2026-10-03', 'Late', 'Sample attendance record'),
(174, 87, '2026-10-10', 'Late', 'Sample attendance record'),
(175, 88, '2027-03-04', 'Late', 'Sample attendance record'),
(176, 88, '2027-03-11', 'Late', 'Sample attendance record'),
(177, 89, '2026-10-05', 'Present', 'Sample attendance record'),
(178, 89, '2026-10-12', 'Late', 'Sample attendance record'),
(179, 90, '2027-03-01', 'Present', 'Sample attendance record'),
(180, 90, '2027-03-08', 'Present', 'Sample attendance record'),
(181, 91, '2026-10-02', 'Present', 'Sample attendance record'),
(182, 91, '2026-10-09', 'Present', 'Sample attendance record'),
(183, 92, '2027-03-03', 'Present', 'Sample attendance record'),
(184, 92, '2027-03-10', 'Present', 'Sample attendance record'),
(185, 93, '2026-10-04', 'Present', 'Sample attendance record'),
(186, 93, '2026-10-11', 'Present', 'Sample attendance record'),
(187, 94, '2027-03-05', 'Present', 'Sample attendance record'),
(188, 94, '2027-03-12', 'Present', 'Sample attendance record'),
(189, 95, '2026-10-01', 'Late', 'Sample attendance record'),
(190, 95, '2026-10-08', 'Absent', 'Sample attendance record'),
(191, 96, '2027-03-02', 'Present', 'Sample attendance record'),
(192, 96, '2027-03-09', 'Present', 'Sample attendance record'),
(193, 97, '2026-10-03', 'Present', 'Sample attendance record'),
(194, 97, '2026-10-10', 'Present', 'Sample attendance record'),
(195, 98, '2027-03-04', 'Late', 'Sample attendance record'),
(196, 98, '2027-03-11', 'Present', 'Sample attendance record'),
(197, 99, '2026-10-05', 'Absent', 'Sample attendance record'),
(198, 99, '2026-10-12', 'Absent', 'Sample attendance record'),
(199, 100, '2027-03-01', 'Absent', 'Sample attendance record'),
(200, 100, '2027-03-08', 'Present', 'Sample attendance record');


INSERT INTO exams (exam_id, offering_id, exam_type, exam_date, max_score) VALUES
(1, 1, 'Midterm', '2026-11-10', 40),
(2, 1, 'Final', '2027-01-05', 60),
(3, 2, 'Midterm', '2027-04-01', 40),
(4, 2, 'Final', '2027-06-01', 60),
(5, 3, 'Midterm', '2026-11-10', 40),
(6, 3, 'Final', '2027-01-05', 60),
(7, 4, 'Midterm', '2027-04-01', 40),
(8, 4, 'Final', '2027-06-01', 60),
(9, 5, 'Midterm', '2026-11-10', 40),
(10, 5, 'Final', '2027-01-05', 60),
(11, 6, 'Midterm', '2027-04-01', 40),
(12, 6, 'Final', '2027-06-01', 60),
(13, 7, 'Midterm', '2026-11-10', 40),
(14, 7, 'Final', '2027-01-05', 60),
(15, 8, 'Midterm', '2027-04-01', 40),
(16, 8, 'Final', '2027-06-01', 60),
(17, 9, 'Midterm', '2026-11-10', 40),
(18, 9, 'Final', '2027-01-05', 60),
(19, 10, 'Midterm', '2027-04-01', 40),
(20, 10, 'Final', '2027-06-01', 60),
(21, 11, 'Midterm', '2026-11-10', 40),
(22, 11, 'Final', '2027-01-05', 60),
(23, 12, 'Midterm', '2027-04-01', 40),
(24, 12, 'Final', '2027-06-01', 60),
(25, 13, 'Midterm', '2026-11-10', 40),
(26, 13, 'Final', '2027-01-05', 60),
(27, 14, 'Midterm', '2027-04-01', 40),
(28, 14, 'Final', '2027-06-01', 60),
(29, 15, 'Midterm', '2026-11-10', 40),
(30, 15, 'Final', '2027-01-05', 60),
(31, 16, 'Midterm', '2027-04-01', 40),
(32, 16, 'Final', '2027-06-01', 60),
(33, 17, 'Midterm', '2026-11-10', 40),
(34, 17, 'Final', '2027-01-05', 60),
(35, 18, 'Midterm', '2027-04-01', 40),
(36, 18, 'Final', '2027-06-01', 60);


INSERT INTO exam_results (result_id, exam_id, enrollment_id, score) VALUES
(1, 1, 1, 34),
(2, 2, 1, 44),
(3, 3, 2, 31),
(4, 4, 2, 57),
(5, 5, 3, 33),
(6, 6, 3, 42),
(7, 7, 4, 32),
(8, 8, 4, 36),
(9, 9, 5, 30),
(10, 10, 5, 39),
(11, 11, 6, 37),
(12, 12, 6, 59),
(13, 13, 7, 22),
(14, 14, 7, 31),
(15, 15, 8, 26),
(16, 16, 8, 53),
(17, 17, 9, 28),
(18, 18, 9, 59),
(19, 19, 10, 26),
(20, 20, 10, 27),
(21, 21, 11, 27),
(22, 22, 11, 46),
(23, 23, 12, 36),
(24, 24, 12, 58),
(25, 25, 13, 22),
(26, 26, 13, 55),
(27, 27, 14, 35),
(28, 28, 14, 57),
(29, 29, 15, 29),
(30, 30, 15, 48),
(31, 31, 16, 35),
(32, 32, 16, 51),
(33, 33, 17, 32),
(34, 34, 17, 47),
(35, 35, 18, 24),
(36, 36, 18, 42),
(37, 1, 19, 36),
(38, 2, 19, 51),
(39, 3, 20, 25),
(40, 4, 20, 53),
(41, 5, 21, 19),
(42, 6, 21, 47),
(43, 7, 22, 33),
(44, 8, 22, 51),
(45, 9, 23, 30),
(46, 10, 23, 36),
(47, 11, 24, 33),
(48, 12, 24, 29),
(49, 13, 25, 22),
(50, 14, 25, 59),
(51, 15, 26, 36),
(52, 16, 26, 48),
(53, 17, 27, 21),
(54, 18, 27, 55),
(55, 19, 28, 21),
(56, 20, 28, 60),
(57, 21, 29, 32),
(58, 22, 29, 27),
(59, 23, 30, 22),
(60, 24, 30, 53),
(61, 25, 31, 38),
(62, 26, 31, 36),
(63, 27, 32, 20),
(64, 28, 32, 57),
(65, 29, 33, 26),
(66, 30, 33, 48),
(67, 31, 34, 37),
(68, 32, 34, 52),
(69, 33, 35, 38),
(70, 34, 35, 32),
(71, 35, 36, 28),
(72, 36, 36, 51),
(73, 1, 37, 28),
(74, 2, 37, 58),
(75, 3, 38, 35),
(76, 4, 38, 29),
(77, 5, 39, 37),
(78, 6, 39, 31),
(79, 7, 40, 25),
(80, 8, 40, 45),
(81, 9, 41, 25),
(82, 10, 41, 32),
(83, 11, 42, 31),
(84, 12, 42, 33),
(85, 13, 43, 38),
(86, 14, 43, 33),
(87, 15, 44, 32),
(88, 16, 44, 37),
(89, 17, 45, 40),
(90, 18, 45, 46),
(91, 19, 46, 18),
(92, 20, 46, 29),
(93, 21, 47, 28),
(94, 22, 47, 30),
(95, 23, 48, 27),
(96, 24, 48, 49),
(97, 25, 49, 29),
(98, 26, 49, 54),
(99, 27, 50, 22),
(100, 28, 50, 42);

INSERT INTO exam_results (result_id, exam_id, enrollment_id, score) VALUES
(101, 29, 51, 34),
(102, 30, 51, 53),
(103, 31, 52, 36),
(104, 32, 52, 38),
(105, 33, 53, 23),
(106, 34, 53, 38),
(107, 35, 54, 20),
(108, 36, 54, 51),
(109, 1, 55, 37),
(110, 2, 55, 42),
(111, 3, 56, 33),
(112, 4, 56, 36),
(113, 5, 57, 25),
(114, 6, 57, 56),
(115, 7, 58, 38),
(116, 8, 58, 43),
(117, 9, 59, 32),
(118, 10, 59, 43),
(119, 11, 60, 39),
(120, 12, 60, 27),
(121, 13, 61, 32),
(122, 14, 61, 45),
(123, 15, 62, 39),
(124, 16, 62, 37),
(125, 17, 63, 20),
(126, 18, 63, 55),
(127, 19, 64, 29),
(128, 20, 64, 46),
(129, 21, 65, 38),
(130, 22, 65, 54),
(131, 23, 66, 40),
(132, 24, 66, 43),
(133, 25, 67, 32),
(134, 26, 67, 46),
(135, 27, 68, 24),
(136, 28, 68, 51),
(137, 29, 69, 33),
(138, 30, 69, 33),
(139, 31, 70, 25),
(140, 32, 70, 51),
(141, 33, 71, 36),
(142, 34, 71, 49),
(143, 35, 72, 36),
(144, 36, 72, 45),
(145, 1, 73, 40),
(146, 2, 73, 45),
(147, 3, 74, 18),
(148, 4, 74, 52),
(149, 5, 75, 26),
(150, 6, 75, 27),
(151, 7, 76, 36),
(152, 8, 76, 30),
(153, 9, 77, 37),
(154, 10, 77, 58),
(155, 11, 78, 27),
(156, 12, 78, 41),
(157, 13, 79, 37),
(158, 14, 79, 49),
(159, 15, 80, 25),
(160, 16, 80, 39),
(161, 17, 81, 37),
(162, 18, 81, 43),
(163, 19, 82, 39),
(164, 20, 82, 35),
(165, 21, 83, 38),
(166, 22, 83, 33),
(167, 23, 84, 38),
(168, 24, 84, 29),
(169, 25, 85, 27),
(170, 26, 85, 55),
(171, 27, 86, 19),
(172, 28, 86, 50),
(173, 29, 87, 22),
(174, 30, 87, 32),
(175, 31, 88, 27),
(176, 32, 88, 47),
(177, 33, 89, 31),
(178, 34, 89, 38),
(179, 35, 90, 24),
(180, 36, 90, 35),
(181, 1, 91, 35),
(182, 2, 91, 50),
(183, 3, 92, 34),
(184, 4, 92, 59),
(185, 5, 93, 26),
(186, 6, 93, 37),
(187, 7, 94, 26),
(188, 8, 94, 57),
(189, 9, 95, 27),
(190, 10, 95, 48),
(191, 11, 96, 21),
(192, 12, 96, 56),
(193, 13, 97, 20),
(194, 14, 97, 36),
(195, 15, 98, 25),
(196, 16, 98, 52),
(197, 17, 99, 35),
(198, 18, 99, 50),
(199, 19, 100, 20),
(200, 20, 100, 52);

INSERT INTO exam_results (result_id, exam_id, enrollment_id, score) VALUES
(201, 21, 101, 18),
(202, 22, 101, 43),
(203, 23, 102, 35),
(204, 24, 102, 34),
(205, 25, 103, 32),
(206, 26, 103, 50),
(207, 27, 104, 39),
(208, 28, 104, 43),
(209, 29, 105, 36),
(210, 30, 105, 51),
(211, 31, 106, 38),
(212, 32, 106, 50),
(213, 33, 107, 21),
(214, 34, 107, 41),
(215, 35, 108, 33),
(216, 36, 108, 28),
(217, 1, 109, 37),
(218, 2, 109, 47),
(219, 3, 110, 37),
(220, 4, 110, 41),
(221, 5, 111, 38),
(222, 6, 111, 31),
(223, 7, 112, 38),
(224, 8, 112, 56),
(225, 9, 113, 40),
(226, 10, 113, 46),
(227, 11, 114, 38),
(228, 12, 114, 53),
(229, 13, 115, 21),
(230, 14, 115, 35),
(231, 15, 116, 19),
(232, 16, 116, 29),
(233, 17, 117, 27),
(234, 18, 117, 58),
(235, 19, 118, 21),
(236, 20, 118, 33),
(237, 21, 119, 25),
(238, 22, 119, 35),
(239, 23, 120, 30),
(240, 24, 120, 56);


INSERT INTO users (user_id, username, password_hash, role, student_id, teacher_id) VALUES
(1, 'admin', '$2y$10$samplehashforadmin', 'Admin', NULL, NULL),
(2, 'teacher01', '$2y$10$samplehashforteacher', 'Teacher', NULL, 1),
(3, 'teacher02', '$2y$10$samplehashforteacher', 'Teacher', NULL, 2),
(4, 'teacher03', '$2y$10$samplehashforteacher', 'Teacher', NULL, 3),
(5, 'teacher04', '$2y$10$samplehashforteacher', 'Teacher', NULL, 4),
(6, 'teacher05', '$2y$10$samplehashforteacher', 'Teacher', NULL, 5),
(7, 'teacher06', '$2y$10$samplehashforteacher', 'Teacher', NULL, 6),
(8, 'teacher07', '$2y$10$samplehashforteacher', 'Teacher', NULL, 7),
(9, 'teacher08', '$2y$10$samplehashforteacher', 'Teacher', NULL, 8),
(10, 'teacher09', '$2y$10$samplehashforteacher', 'Teacher', NULL, 9),
(11, 'teacher10', '$2y$10$samplehashforteacher', 'Teacher', NULL, 10),
(12, 'teacher11', '$2y$10$samplehashforteacher', 'Teacher', NULL, 11),
(13, 'teacher12', '$2y$10$samplehashforteacher', 'Teacher', NULL, 12),
(14, 'teacher13', '$2y$10$samplehashforteacher', 'Teacher', NULL, 13),
(15, 'teacher14', '$2y$10$samplehashforteacher', 'Teacher', NULL, 14),
(16, 'teacher15', '$2y$10$samplehashforteacher', 'Teacher', NULL, 15),
(17, 'student001', '$2y$10$samplehashforstudent', 'Student', 1, NULL),
(18, 'student002', '$2y$10$samplehashforstudent', 'Student', 2, NULL),
(19, 'student003', '$2y$10$samplehashforstudent', 'Student', 3, NULL),
(20, 'student004', '$2y$10$samplehashforstudent', 'Student', 4, NULL),
(21, 'student005', '$2y$10$samplehashforstudent', 'Student', 5, NULL),
(22, 'student006', '$2y$10$samplehashforstudent', 'Student', 6, NULL),
(23, 'student007', '$2y$10$samplehashforstudent', 'Student', 7, NULL),
(24, 'student008', '$2y$10$samplehashforstudent', 'Student', 8, NULL),
(25, 'student009', '$2y$10$samplehashforstudent', 'Student', 9, NULL),
(26, 'student010', '$2y$10$samplehashforstudent', 'Student', 10, NULL),
(27, 'student011', '$2y$10$samplehashforstudent', 'Student', 11, NULL),
(28, 'student012', '$2y$10$samplehashforstudent', 'Student', 12, NULL),
(29, 'student013', '$2y$10$samplehashforstudent', 'Student', 13, NULL),
(30, 'student014', '$2y$10$samplehashforstudent', 'Student', 14, NULL),
(31, 'student015', '$2y$10$samplehashforstudent', 'Student', 15, NULL),
(32, 'student016', '$2y$10$samplehashforstudent', 'Student', 16, NULL),
(33, 'student017', '$2y$10$samplehashforstudent', 'Student', 17, NULL),
(34, 'student018', '$2y$10$samplehashforstudent', 'Student', 18, NULL),
(35, 'student019', '$2y$10$samplehashforstudent', 'Student', 19, NULL),
(36, 'student020', '$2y$10$samplehashforstudent', 'Student', 20, NULL);


-- ============================================================
-- Useful test queries
-- ============================================================

-- Show all departments:
-- SELECT * FROM departments;

-- Show teachers with their departments:
-- SELECT t.teacher_id, t.teacher_name, t.academic_rank, d.department_name
-- FROM teachers t
-- JOIN departments d ON t.department_id = d.department_id
-- ORDER BY d.department_name, t.teacher_name;

-- Show students with their departments:
-- SELECT s.student_id, s.student_name, s.email, d.department_name
-- FROM students s
-- JOIN departments d ON s.department_id = d.department_id
-- ORDER BY s.student_id;

-- Show course offerings:
-- SELECT co.offering_id, c.course_code, c.course_name, t.teacher_name,
--        sem.semester_name, cl.room_code
-- FROM course_offerings co
-- JOIN courses c ON co.course_id = c.course_id
-- JOIN teachers t ON co.teacher_id = t.teacher_id
-- JOIN semesters sem ON co.semester_id = sem.semester_id
-- JOIN classrooms cl ON co.classroom_id = cl.classroom_id
-- ORDER BY co.offering_id;

-- Count sample data:
SELECT 'departments' AS table_name, COUNT(*) AS total_records FROM departments
UNION ALL SELECT 'teachers', COUNT(*) FROM teachers
UNION ALL SELECT 'students', COUNT(*) FROM students
UNION ALL SELECT 'courses', COUNT(*) FROM courses
UNION ALL SELECT 'course_offerings', COUNT(*) FROM course_offerings
UNION ALL SELECT 'enrollments', COUNT(*) FROM enrollments
UNION ALL SELECT 'attendance', COUNT(*) FROM attendance
UNION ALL SELECT 'exams', COUNT(*) FROM exams
UNION ALL SELECT 'exam_results', COUNT(*) FROM exam_results
UNION ALL SELECT 'users', COUNT(*) FROM users;
