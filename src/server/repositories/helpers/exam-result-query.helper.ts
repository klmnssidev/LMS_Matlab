import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type ExamResultFilters = {
  examId?: number;
  enrollmentId?: number;
  studentId?: number;
};

export const examResultInclude = {
  exam: true,
  enrollment: { include: { student: true, offering: { include: { course: true } } } },
} satisfies Prisma.ExamResultInclude;

export function buildExamResultWhere(
  filters: ExamResultFilters,
  scope?: AuthorizationScope
): Prisma.ExamResultWhereInput {
  const where: Prisma.ExamResultWhereInput = {};

  if (scope?.role === "Teacher") {
    where.exam = { offering: { teacherId: scope.teacherId } };
  } else if (scope?.role === "Student") {
    where.enrollment = { studentId: scope.studentId };
  }

  if (filters.examId) where.examId = filters.examId;
  if (filters.enrollmentId) where.enrollmentId = filters.enrollmentId;
  if (filters.studentId && scope?.role !== "Student") {
    where.enrollment = { ...(where.enrollment as object), studentId: filters.studentId };
  }

  return where;
}
