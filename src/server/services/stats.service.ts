import { prisma } from "@/server/lib/prisma";
import * as statsRepo from "@/server/repositories/stats.repository";
import * as departmentRepo from "@/server/repositories/department.repository";
import * as offeringService from "@/server/services/course-offering.service";
import type { AuthorizationScope } from "@/permissions";
import { calculateGpa } from "@/server/lib/academic/gpa";
import { calculateAttendancePercentage } from "@/server/lib/academic/attendance";
import { calculateCompletedCredits } from "@/server/lib/academic/credits";

type EnrollAgg = { total: number; active: number; completed: number };
type UpcomingExam = { exam_id: number; exam_type: string; exam_date: string; course_name: string; course_code: string };
type AttSummary = { status: string; count: number };
type RecentGrade = { exam_type: string; course_name: string; score: number; max_score: number };

export type DashboardStats = {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalDepartments: number;
  activeEnrollments: number;
  studentsByDepartment: { department_name: string; count: number }[];
  enrollmentTrend: { semester_name: string; count: number }[];
  gradeDistribution: { grade: string; count: number }[];
};

export type StudentDashboardStats = {
  enrollments: EnrollAgg;
  upcomingExams: UpcomingExam[];
  attendance: AttSummary[];
  attendancePercentage: number;
  gpa: number | null;
  completedCredits: number;
  departmentName: string;
  currentSemester: string | null;
  recentGrades: RecentGrade[];
  semesters: { semesterId: number; semesterName: string; academicYear: string }[];
};

export type TeacherStats = {
  totalOfferings: number;
  totalStudents: number;
  upcomingExams: { exam_id: number; course_name: string; exam_date: string; exam_type: string }[];
};

async function getEnrollmentStats(studentId: number): Promise<EnrollAgg> {
  return statsRepo.getStudentEnrollmentAgg(studentId);
}

async function getUpcomingExams(studentId: number): Promise<UpcomingExam[]> {
  return statsRepo.getStudentUpcomingExams(studentId);
}

async function getAttendanceStats(studentId: number, semesterId?: number): Promise<{ attendance: AttSummary[]; attendancePercentage: number }> {
  const raw = await statsRepo.getStudentAttendanceSummary(studentId, semesterId);
  const percentage = calculateAttendancePercentage(raw);
  return { attendance: raw, attendancePercentage: percentage };
}

async function getGpaStats(studentId: number): Promise<number | null> {
  const raw = await statsRepo.getStudentRawGrades(studentId);
  return calculateGpa(raw.map((r) => ({ finalGrade: r.final_grade, creditHours: r.credit_hours })));
}

async function getCreditsStats(studentId: number): Promise<number> {
  const raw = await statsRepo.getStudentCreditEnrollments(studentId);
  return calculateCompletedCredits(raw.map((r) => ({ status: r.status, creditHours: r.credit_hours })));
}

async function getDepartmentInfo(departmentId: number): Promise<string> {
  const dept = await departmentRepo.findById(departmentId);
  return dept?.departmentName ?? "—";
}

async function getCurrentSemester(): Promise<string | null> {
  return statsRepo.getCurrentSemester();
}

async function getRecentGrades(studentId: number): Promise<RecentGrade[]> {
  const raw = await statsRepo.getStudentRecentGrades(studentId);
  return raw.map((g) => ({
    exam_type: g.exam_type,
    course_name: g.course_name,
    score: g.score,
    max_score: g.max_score,
  }));
}

async function getSemesters(studentId: number): Promise<{ semesterId: number; semesterName: string; academicYear: string }[]> {
  return statsRepo.getStudentSemesters(studentId);
}

export async function getAdminStats(): Promise<DashboardStats> {
  const [totalStudents, totalTeachers, totalCourses, totalDepartments, activeEnrollments, studentsByDepartment, enrollmentTrend, gradeDistribution] = await Promise.all([
    statsRepo.getAdminTotalStudents(),
    statsRepo.getAdminTotalTeachers(),
    statsRepo.getAdminTotalCourses(),
    statsRepo.getAdminTotalDepartments(),
    statsRepo.getAdminActiveEnrollments(),
    statsRepo.getAdminStudentsByDepartment(),
    statsRepo.getAdminEnrollmentTrend(),
    statsRepo.getAdminGradeDistribution(),
  ]);

  return {
    totalStudents,
    totalTeachers,
    totalCourses,
    totalDepartments,
    activeEnrollments,
    studentsByDepartment,
    enrollmentTrend,
    gradeDistribution,
  };
}

export async function getStudentStats(
  studentId: number,
  studentDepartmentId: number,
  semesterId?: number
): Promise<StudentDashboardStats> {
  const [enrollments, upcomingExams, attendanceStats, gpa, completedCredits, departmentName, currentSemester, recentGrades, semesters] = await Promise.all([
    getEnrollmentStats(studentId),
    getUpcomingExams(studentId),
    getAttendanceStats(studentId, semesterId),
    getGpaStats(studentId),
    getCreditsStats(studentId),
    getDepartmentInfo(studentDepartmentId),
    getCurrentSemester(),
    getRecentGrades(studentId),
    getSemesters(studentId),
  ]);

  return {
    enrollments,
    upcomingExams,
    attendance: attendanceStats.attendance,
    attendancePercentage: attendanceStats.attendancePercentage,
    gpa,
    completedCredits,
    departmentName,
    currentSemester,
    recentGrades,
    semesters,
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

export async function getMyStats(scope: AuthorizationScope, semesterId?: number) {
  if (scope.role === "Admin") {
    return getAdminStats();
  }

  if (scope.role === "Teacher") {
    const [stats, offerings] = await Promise.all([
      getTeacherStats(scope.teacherId),
      offeringService.list({}, scope),
    ]);
    return {
      ...stats,
      offerings: offerings.map((o) => ({
        offering_id: o.offeringId,
        course_code: o.courseCode,
        course_name: o.courseName,
        section_name: o.sectionName,
        semester_name: o.semesterName,
        room_code: o.roomCode,
        max_students: o.maxStudents,
      })),
    };
  }

  return getStudentStats(scope.studentId, scope.departmentId, semesterId);
}
