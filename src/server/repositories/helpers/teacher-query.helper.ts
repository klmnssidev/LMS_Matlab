import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type TeacherFilters = {
  departmentId?: number;
  search?: string;
  limit?: number;
  offset?: number;
};

export const teacherInclude = {
  department: true,
} satisfies Prisma.TeacherInclude;

export function buildTeacherWhere(
  filters: TeacherFilters,
  scope?: AuthorizationScope
): Prisma.TeacherWhereInput {
  const where: Prisma.TeacherWhereInput = {};

  if (scope?.role === "Teacher") {
    where.teacherId = scope.teacherId;
  }

  if (filters.departmentId) {
    where.departmentId = filters.departmentId;
  }
  if (filters.search) {
    where.OR = [
      { teacherName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}
