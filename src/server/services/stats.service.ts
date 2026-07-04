import { prisma } from "@/server/lib/prisma";
import * as statsRepo from "@/server/repositories/stats.repository";
import * as departmentRepo from "@/server/repositories/department.repository";
import * as offeringService from "@/server/services/course-offering.service";
import type { AuthorizationScope } from "@/permissions";

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
  totalCourseOfferings: number;
  examsThisSemester: number;
  attendanceRate: number | null;
  activeSemester: string | null;
  studentsByDepartment: { department_name: string; count: number }[];
  enrollmentTrend: { semester_name: string; count: number }[];
  gradeDistribution: { grade: string; count: number }[];
  attendanceOverview: { status: string; count: number }[];
  courseEnrollmentDistribution: { course_name: string; count: number }[];
  recentEnrollments: { enrollment_id: number; student_name: string; course_name: string; section_name: string; enrollment_date: string }[];
  recentlyCreatedExams: { exam_id: number; exam_type: string; exam_date: string; course_code: string; course_name: string }[];
  latestAttendance: { attendance_id: number; student_name: string; course_name: string; attendance_date: string; status: string }[];
};

export type StudentStats = {
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

export async function getAdminStats(): Promise<DashboardStats> {
  const [totalStudents, totalTeachers, totalCourses, totalDepartments, activeEnrollments, totalCourseOfferings, examsThisSemester, attendanceRate, activeSemester, studentsByDepartment, enrollmentTrend, gradeDistribution, attendanceOverview, courseEnrollmentDistribution, recentEnrollments, recentlyCreatedExams, latestAttendance] = await Promise.all([
    statsRepo.getAdminTotalStudents(),
    statsRepo.getAdminTotalTeachers(),
    statsRepo.getAdminTotalCourses(),
    statsRepo.getAdminTotalDepartments(),
    statsRepo.getAdminActiveEnrollments(),
    statsRepo.getAdminCourseOfferings(),
    statsRepo.getAdminExamsThisSemester(),
    statsRepo.getAdminAttendanceRate(),
    statsRepo.getAdminActiveSemester(),
    statsRepo.getAdminStudentsByDepartment(),
    statsRepo.getAdminEnrollmentTrend(),
    statsRepo.getAdminGradeDistribution(),
    statsRepo.getAdminAttendanceOverview(),
    statsRepo.getAdminCourseEnrollmentDistribution(),
    statsRepo.getAdminRecentEnrollments(),
    statsRepo.getAdminRecentlyCreatedExams(),
    statsRepo.getAdminLatestAttendance(),
  ]);

  return {
    totalStudents,
    totalTeachers,
    totalCourses,
    totalDepartments,
    activeEnrollments,
    totalCourseOfferings,
    examsThisSemester,
    attendanceRate,
    activeSemester,
    studentsByDepartment,
    enrollmentTrend,
    gradeDistribution,
    attendanceOverview,
    courseEnrollmentDistribution,
    recentEnrollments,
    recentlyCreatedExams,
    latestAttendance,
  };
}

export async function getStudentStats(
  studentId: number,
  studentDepartmentId: number,
  semesterId?: number
): Promise<StudentStats> {
  const department = await departmentRepo.findById(studentDepartmentId);
  const [enrollments, upcomingExams, attendance, attendancePercentage, gpa, completedCredits, currentSemester, recentGrades, semesters] = await Promise.all([
    statsRepo.getStudentEnrollmentAgg(studentId),
    statsRepo.getStudentUpcomingExams(studentId),
    statsRepo.getStudentAttendanceSummary(studentId, semesterId),
    statsRepo.getStudentAttendancePercentage(studentId, semesterId),
    statsRepo.getStudentGpa(studentId),
    statsRepo.getStudentCompletedCredits(studentId),
    statsRepo.getCurrentSemester(),
    statsRepo.getStudentRecentGrades(studentId),
    statsRepo.getStudentSemesters(studentId),
  ]);

  return {
    enrollments,
    upcomingExams,
    attendance,
    attendancePercentage,
    gpa,
    completedCredits,
    departmentName: department?.departmentName ?? "—",
    currentSemester,
    recentGrades: recentGrades.map((g) => ({
      exam_type: g.exam_type,
      course_name: g.course_name,
      score: g.score,
      max_score: g.max_score,
    })),
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
