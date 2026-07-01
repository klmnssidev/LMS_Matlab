import { prisma } from "@/server/lib/prisma";
import { Prisma } from "@prisma/client";

type EnrollAgg = { total: number; active: number; completed: number };
type UpcomingExam = { exam_id: number; exam_type: string; exam_date: string; course_name: string; course_code: string };
type AttSummary = { status: string; count: number };
type StudentByDept = { department_name: string; count: number };
type EnrollTrend = { semester_name: string; count: number };
type GradeDist = { grade: string; count: number };
type RecentGrade = { exam_type: string; course_name: string; score: number; max_score: number };

export async function getStudentEnrollmentAgg(studentId: number): Promise<EnrollAgg> {
  const rows = await prisma.$queryRaw<EnrollAgg[]>`
    SELECT
      COUNT(*)::int as total,
      SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END)::int as active,
      SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END)::int as completed
    FROM enrollments
    WHERE student_id = ${studentId}
  `;
  return rows[0] ?? { total: 0, active: 0, completed: 0 };
}

export async function getStudentUpcomingExams(studentId: number): Promise<UpcomingExam[]> {
  return prisma.$queryRaw<UpcomingExam[]>`
    SELECT ex.exam_id, ex.exam_type, ex.exam_date::text, c.course_name, c.course_code
    FROM exams ex
    JOIN course_offerings o ON o.offering_id = ex.offering_id
    JOIN courses c ON c.course_id = o.course_id
    JOIN enrollments e ON e.offering_id = o.offering_id AND e.student_id = ${studentId}
    WHERE ex.exam_date >= CURRENT_DATE
    ORDER BY ex.exam_date
    LIMIT 5
  `;
}

export async function getStudentAttendanceSummary(studentId: number, semesterId?: number): Promise<AttSummary[]> {
  const semesterFilter = semesterId
    ? Prisma.sql`AND o.semester_id = ${semesterId}`
    : Prisma.empty;

  return prisma.$queryRaw<AttSummary[]>`
    SELECT a.status, COUNT(*)::int as count
    FROM attendance a
    JOIN enrollments e ON e.enrollment_id = a.enrollment_id AND e.student_id = ${studentId}
    LEFT JOIN course_offerings o ON o.offering_id = e.offering_id
    WHERE 1=1
    ${semesterFilter}
    GROUP BY a.status
  `;
}

export type RawGrade = { final_grade: string | null; credit_hours: number };

export async function getStudentRawGrades(studentId: number, semesterId?: number): Promise<RawGrade[]> {
  const semesterFilter = semesterId
    ? Prisma.sql`AND o.semester_id = ${semesterId}`
    : Prisma.empty;

  return prisma.$queryRaw<RawGrade[]>`
    SELECT e.final_grade, co.credit_hours
    FROM enrollments e
    JOIN course_offerings o ON o.offering_id = e.offering_id
    JOIN courses co ON co.course_id = o.course_id
    WHERE e.student_id = ${studentId} AND e.final_grade IS NOT NULL AND e.final_grade != ''
    ${semesterFilter}
  `;
}

export type RawCreditEnrollment = { status: string; credit_hours: number };

export async function getStudentCreditEnrollments(studentId: number, semesterId?: number): Promise<RawCreditEnrollment[]> {
  const semesterFilter = semesterId
    ? Prisma.sql`AND o.semester_id = ${semesterId}`
    : Prisma.empty;

  return prisma.$queryRaw<RawCreditEnrollment[]>`
    SELECT e.status, co.credit_hours
    FROM enrollments e
    JOIN course_offerings o ON o.offering_id = e.offering_id
    JOIN courses co ON co.course_id = o.course_id
    WHERE e.student_id = ${studentId}
    ${semesterFilter}
  `;
}

export async function getCurrentSemester(): Promise<string | null> {
  const rows = await prisma.$queryRaw<{ semester_name: string }[]>`
    SELECT semester_name
    FROM semesters
    WHERE CURRENT_DATE BETWEEN start_date AND end_date
    LIMIT 1
  `;
  return rows[0]?.semester_name ?? null;
}

export async function getStudentRecentGrades(studentId: number): Promise<RecentGrade[]> {
  return prisma.$queryRaw<RecentGrade[]>`
    SELECT ex.exam_type, c.course_name, er.score::float, ex.max_score::float
    FROM exam_results er
    JOIN exams ex ON ex.exam_id = er.exam_id
    JOIN enrollments e ON e.enrollment_id = er.enrollment_id AND e.student_id = ${studentId}
    JOIN course_offerings o ON o.offering_id = ex.offering_id
    JOIN courses c ON c.course_id = o.course_id
    ORDER BY er.result_id DESC
    LIMIT 5
  `;
}

export async function getAdminTotalStudents(): Promise<number> {
  return prisma.student.count();
}

export async function getAdminTotalTeachers(): Promise<number> {
  return prisma.teacher.count();
}

export async function getAdminTotalCourses(): Promise<number> {
  return prisma.course.count();
}

export async function getAdminTotalDepartments(): Promise<number> {
  return prisma.department.count();
}

export async function getAdminActiveEnrollments(): Promise<number> {
  return prisma.enrollment.count({ where: { status: "Active" } });
}

export async function getAdminStudentsByDepartment(): Promise<StudentByDept[]> {
  const rows = await prisma.department.findMany({
    select: {
      departmentName: true,
      _count: { select: { students: true } },
    },
    orderBy: { departmentName: "asc" },
  });
  return rows.map((s) => ({
    department_name: s.departmentName,
    count: s._count.students,
  }));
}

export async function getAdminEnrollmentTrend(): Promise<EnrollTrend[]> {
  return prisma.$queryRaw<EnrollTrend[]>`
    SELECT sem.semester_name, COUNT(*)::int as count
    FROM enrollments e
    JOIN course_offerings o ON o.offering_id = e.offering_id
    JOIN semesters sem ON sem.semester_id = o.semester_id
    GROUP BY sem.semester_name
    ORDER BY MIN(sem.start_date)
  `;
}

export async function getAdminGradeDistribution(): Promise<GradeDist[]> {
  return prisma.$queryRaw<GradeDist[]>`
    SELECT COALESCE(final_grade, 'N/A') as grade, COUNT(*)::int as count
    FROM enrollments
    GROUP BY grade
    ORDER BY count DESC
  `;
}

export type StudentSemester = { semesterId: number; semesterName: string; academicYear: string };

export async function getStudentSemesters(studentId: number): Promise<StudentSemester[]> {
  return prisma.$queryRaw<StudentSemester[]>`
    SELECT DISTINCT sem.semester_id as "semesterId", sem.semester_name as "semesterName", sem.academic_year as "academicYear"
    FROM enrollments e
    JOIN course_offerings o ON o.offering_id = e.offering_id
    JOIN semesters sem ON sem.semester_id = o.semester_id
    WHERE e.student_id = ${studentId}
    ORDER BY sem.semester_id DESC
  `;
}
