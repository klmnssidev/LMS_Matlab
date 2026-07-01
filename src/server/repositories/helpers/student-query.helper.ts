import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type StudentFilters = {
  departmentId?: number;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export const studentInclude = {
  department: true,
} satisfies Prisma.StudentInclude;

export function buildStudentWhere(
  filters: StudentFilters,
  scope?: AuthorizationScope
): Prisma.StudentWhereInput {
  const where: Prisma.StudentWhereInput = {};

  if (scope?.role === "Teacher") {
    where.enrollments = { some: { offering: { teacherId: scope.teacherId } } };
  } else if (scope?.role === "Student") {
    where.studentId = scope.studentId;
  }

  if (filters.departmentId) {
    where.departmentId = filters.departmentId;
  }
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.search) {
    where.OR = [
      { studentName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}
