import { prisma } from "@/server/lib/prisma";

type StudentByDept = { department_name: string; count: number };
type EnrollTrend = { semester_name: string; count: number };
type GradeDist = { grade: string; count: number };
type EnrollAgg = { total: number; active: number; completed: number };
type UpcomingExam = { exam_id: number; exam_type: string; exam_date: string; course_name: string; course_code: string };
type AttSummary = { status: string; count: number };

export type DashboardStats = {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalDepartments: number;
  activeEnrollments: number;
  studentsByDepartment: StudentByDept[];
  enrollmentTrend: EnrollTrend[];
  gradeDistribution: GradeDist[];
};

export type StudentStats = {
  enrollments: EnrollAgg;
  upcomingExams: UpcomingExam[];
  attendance: AttSummary[];
};

export type TeacherStats = {
  totalOfferings: number;
  totalStudents: number;
  upcomingExams: { exam_id: number; course_name: string; exam_date: string; exam_type: string }[];
};

export async function getAdminStats(): Promise<DashboardStats> {
  const [totalStudents, totalTeachers, totalCourses, totalDepartments, activeEnrollments, studentsByDepartment, enrollmentTrend, gradeDistribution] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.course.count(),
    prisma.department.count(),
    prisma.enrollment.count({ where: { status: "Active" } }),
    prisma.department.findMany({
      select: {
        departmentName: true,
        _count: { select: { students: true } },
      },
      orderBy: { departmentName: "asc" },
    }),
    prisma.$queryRaw<EnrollTrend[]>`
      SELECT sem.semester_name, COUNT(*)::int as count
      FROM enrollments e
      JOIN course_offerings o ON o.offering_id = e.offering_id
      JOIN semesters sem ON sem.semester_id = o.semester_id
      GROUP BY sem.semester_name
      ORDER BY MIN(sem.start_date)
    `,
    prisma.$queryRaw<GradeDist[]>`
      SELECT COALESCE(final_grade, 'N/A') as grade, COUNT(*)::int as count
      FROM enrollments
      GROUP BY grade
      ORDER BY count DESC
    `,
  ]);

  return {
    totalStudents,
    totalTeachers,
    totalCourses,
    totalDepartments,
    activeEnrollments,
    studentsByDepartment: studentsByDepartment.map((s) => ({
      department_name: s.departmentName,
      count: s._count.students,
    })),
    enrollmentTrend,
    gradeDistribution,
  };
}

export async function getStudentStats(studentId: number): Promise<StudentStats> {
  const [enrollments, upcomingExams, attendance] = await Promise.all([
    prisma.$queryRaw<EnrollAgg[]>`
      SELECT
        COUNT(*)::int as total,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END)::int as active,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END)::int as completed
      FROM enrollments
      WHERE student_id = ${studentId}
    `,
    prisma.$queryRaw<UpcomingExam[]>`
      SELECT ex.exam_id, ex.exam_type, ex.exam_date::text, c.course_name, c.course_code
      FROM exams ex
      JOIN course_offerings o ON o.offering_id = ex.offering_id
      JOIN courses c ON c.course_id = o.course_id
      JOIN enrollments e ON e.offering_id = o.offering_id AND e.student_id = ${studentId}
      WHERE ex.exam_date >= CURRENT_DATE
      ORDER BY ex.exam_date
      LIMIT 5
    `,
    prisma.$queryRaw<AttSummary[]>`
      SELECT a.status, COUNT(*)::int as count
      FROM attendance a
      JOIN enrollments e ON e.enrollment_id = a.enrollment_id AND e.student_id = ${studentId}
      GROUP BY a.status
    `,
  ]);

  return {
    enrollments: enrollments[0],
    upcomingExams,
    attendance,
  };
}

export async function getTeacherStats(teacherId: number): Promise<TeacherStats> {
  const [offeringsCount, studentCount, exams] = await Promise.all([
    prisma.courseOffering.count({ where: { teacherId } }),
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT e.student_id)::int as count
      FROM enrollments e
      JOIN course_offerings o ON o.offering_id = e.offering_id AND o.teacher_id = ${teacherId}
    `,
    prisma.$queryRaw<{ exam_id: number; course_name: string; exam_date: string; exam_type: string }[]>`
      SELECT ex.exam_id, c.course_name, ex.exam_date::text, ex.exam_type
      FROM exams ex
      JOIN course_offerings o ON o.offering_id = ex.offering_id AND o.teacher_id = ${teacherId}
      JOIN courses c ON c.course_id = o.course_id
      WHERE ex.exam_date >= CURRENT_DATE
      ORDER BY ex.exam_date
      LIMIT 5
    `,
  ]);

  return {
    totalOfferings: offeringsCount,
    totalStudents: Number(studentCount[0]?.count ?? 0),
    upcomingExams: exams,
  };
}
