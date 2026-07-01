import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type ExamFilters = {
  offeringId?: number;
};

export const examInclude = {
  offering: { include: { course: true } },
} satisfies Prisma.ExamInclude;

export function buildExamWhere(
  filters: ExamFilters = {},
  scope?: AuthorizationScope
): Prisma.ExamWhereInput {
  const where: Prisma.ExamWhereInput = {};

  if (scope?.role === "Teacher") {
    where.offering = { teacherId: scope.teacherId };
  } else if (scope?.role === "Student") {
    where.offering = { enrollments: { some: { studentId: scope.studentId } } };
  }

  if (filters.offeringId) where.offeringId = filters.offeringId;

  return where;
}
