import { db } from "@/lib/db";

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalDepartments: number;
  activeEnrollments: number;
  studentsByDepartment: { department_name: string; count: number }[];
  enrollmentTrend: { semester_name: string; count: number }[];
  gradeDistribution: { grade: string; count: number }[];
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [studentCount, teacherCount, courseCount, deptCount, enrollmentCount, byDept, trend, grades] =
    await Promise.all([
      db.query("SELECT COUNT(*) as count FROM students"),
      db.query("SELECT COUNT(*) as count FROM teachers"),
      db.query("SELECT COUNT(*) as count FROM courses"),
      db.query("SELECT COUNT(*) as count FROM departments"),
      db.query("SELECT COUNT(*) as count FROM enrollments WHERE status = 'Active'"),
      db.query(
        `SELECT d.department_name, COUNT(*)::int as count
         FROM students s
         JOIN departments d ON d.department_id = s.department_id
         GROUP BY d.department_name
         ORDER BY count DESC`
      ),
      db.query(
        `SELECT sem.semester_name, COUNT(*)::int as count
         FROM enrollments e
         JOIN course_offerings o ON o.offering_id = e.offering_id
         JOIN semesters sem ON sem.semester_id = o.semester_id
         GROUP BY sem.semester_name
         ORDER BY MIN(sem.start_date)`
      ),
      db.query(
        `SELECT COALESCE(final_grade, 'N/A') as grade, COUNT(*)::int as count
         FROM enrollments
         GROUP BY grade
         ORDER BY count DESC`
      ),
    ]);

  return {
    totalStudents: Number(studentCount.rows[0].count),
    totalTeachers: Number(teacherCount.rows[0].count),
    totalCourses: Number(courseCount.rows[0].count),
    totalDepartments: Number(deptCount.rows[0].count),
    activeEnrollments: Number(enrollmentCount.rows[0].count),
    studentsByDepartment: byDept.rows.map((r) => ({
      department_name: r.department_name,
      count: r.count,
    })),
    enrollmentTrend: trend.rows.map((r) => ({
      semester_name: r.semester_name,
      count: r.count,
    })),
    gradeDistribution: grades.rows.map((r) => ({
      grade: r.grade,
      count: r.count,
    })),
  };
}

export async function getStudentDashboardStats(studentId: number) {
  const [enrollments, upcomingExams, attendance] = await Promise.all([
    db.query(
      `SELECT COUNT(*)::int as total,
              SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END)::int as active,
              SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END)::int as completed
       FROM enrollments
       WHERE student_id = $1`,
      [studentId]
    ),
    db.query(
      `SELECT ex.*, c.course_name, c.course_code
       FROM exams ex
       JOIN course_offerings o ON o.offering_id = ex.offering_id
       JOIN courses c ON c.course_id = o.course_id
       JOIN enrollments e ON e.offering_id = o.offering_id AND e.student_id = $1
       WHERE ex.exam_date >= CURRENT_DATE
       ORDER BY ex.exam_date
       LIMIT 5`,
      [studentId]
    ),
    db.query(
      `SELECT a.status, COUNT(*)::int as count
       FROM attendance a
       JOIN enrollments e ON e.enrollment_id = a.enrollment_id AND e.student_id = $1
       GROUP BY a.status`,
      [studentId]
    ),
  ]);

  return {
    enrollments: enrollments.rows[0],
    upcomingExams: upcomingExams.rows,
    attendance: attendance.rows,
  };
}

export async function getTeacherDashboardStats(teacherId: number) {
  const [offerings, studentCount, exams] = await Promise.all([
    db.query("SELECT COUNT(*)::int as total FROM course_offerings WHERE teacher_id = $1", [teacherId]),
    db.query(
      `SELECT COUNT(DISTINCT e.student_id)::int as count
       FROM enrollments e
       JOIN course_offerings o ON o.offering_id = e.offering_id AND o.teacher_id = $1`,
      [teacherId]
    ),
    db.query(
      `SELECT ex.*, c.course_name
       FROM exams ex
       JOIN course_offerings o ON o.offering_id = ex.offering_id AND o.teacher_id = $1
       JOIN courses c ON c.course_id = o.course_id
       WHERE ex.exam_date >= CURRENT_DATE
       ORDER BY ex.exam_date
       LIMIT 5`,
      [teacherId]
    ),
  ]);

  return {
    totalOfferings: Number(offerings.rows[0].total),
    totalStudents: Number(studentCount.rows[0].count),
    upcomingExams: exams.rows,
  };
}
