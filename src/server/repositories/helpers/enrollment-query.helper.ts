import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type EnrollmentFilters = {
  studentId?: number;
  offeringId?: number;
  status?: string;
};

export const enrollmentInclude = {
  student: true,
  offering: {
    include: {
      course: { include: { department: true } },
      semester: true,
      teacher: true,
    },
  },
} satisfies Prisma.EnrollmentInclude;

export function buildEnrollmentWhere(
  filters: EnrollmentFilters,
  scope?: AuthorizationScope
): Prisma.EnrollmentWhereInput {
  const where: Prisma.EnrollmentWhereInput = {};

  if (scope?.role === "Teacher") {
    where.offering = { teacherId: scope.teacherId };
  } else if (scope?.role === "Student") {
    where.studentId = scope.studentId;
  }

  if (filters.studentId && scope?.role !== "Student") where.studentId = filters.studentId;
  if (filters.offeringId) where.offeringId = filters.offeringId;
  if (filters.status) where.status = filters.status;

  return where;
}
