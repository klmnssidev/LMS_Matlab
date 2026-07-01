import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type CourseFilters = {
  search?: string;
  limit?: number;
  offset?: number;
};

export const courseInclude = {
  department: true,
} satisfies Prisma.CourseInclude;

export const courseDetailInclude = {
  department: true,
  courseOfferings: {
    include: {
      teacher: true,
      semester: true,
      classroom: true,
    },
  },
} satisfies Prisma.CourseInclude;

export function buildCourseWhere(
  filters: CourseFilters,
  scope?: AuthorizationScope
): Prisma.CourseWhereInput {
  const where: Prisma.CourseWhereInput = {};

  if (scope?.role === "Student") {
    where.departmentId = scope.departmentId;
  }

  if (filters.search) {
    where.OR = [
      { courseName: { contains: filters.search, mode: "insensitive" } },
      { courseCode: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}
