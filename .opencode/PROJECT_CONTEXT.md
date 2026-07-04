# Enterprise Learning Management System (LMS)

## Overview

This project is an Enterprise Learning Management System (LMS) for universities.

The system manages:

- Departments
- Teachers
- Students
- Courses
- Course Offerings
- Enrollments
- Attendance
- Exams
- Exam Results
- Academic Transcript
- Student Dashboard
- Teacher Dashboard
- Admin Dashboard

The system is intentionally lightweight.

It is NOT an online learning platform.

There are

- no videos
- no assignments
- no quizzes editor
- no chat system
- no LMS content delivery

The focus is academic management.

---

# User Roles

## Student

Students can

- View their profile
- View enrolled courses
- View attendance
- View grades
- View transcript
- View schedule
- Enroll in courses
- View dashboard

Students can ONLY access their own data.

Students can ONLY enroll in courses inside their own department.

Students cannot

- View other students
- View teachers
- View admin pages
- Access another department

---

## Teacher

Teachers can

- Manage attendance
- Manage exams
- Manage exam results
- View students enrolled in their own offerings
- View their schedule
- View dashboard

Teachers can NEVER

- View all students
- View all courses
- Manage departments

Teachers only manage their own course offerings.

---

## Admin

Admins have complete access.

Admins manage

- Departments
- Teachers
- Students
- Courses
- Semesters
- Classrooms
- Course Offerings
- Enrollments
- Users
- Posters

---

# Authentication

Authentication is handled ONLY by Clerk.

Clerk is NOT the source of truth for roles.

---

# Authorization

CASL

↓

Permissions

AuthorizationScope

↓

Ownership

---

# UserAccount

UserAccount is the single source of truth.

UserAccount stores

- role
- clerkUserId
- linked Student
- linked Teacher
- active status

Never use Clerk metadata for authorization.

---

# UI

Design principles

- Modern
- Clean
- Enterprise
- Responsive

Use

- TailwindCSS
- shadcn/ui

Never introduce another UI framework.

---

# State Management

TanStack Query

↓

Server State

Zustand

↓

Client/UI State

Never mix them.

---

# Goal

The goal is to build a maintainable Enterprise University Management System.

Every feature should improve maintainability, scalability and user experience.