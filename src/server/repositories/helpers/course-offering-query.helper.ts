import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type OfferingFilters = {
  courseId?: number;
  teacherId?: number;
  semesterId?: number;
};

export const offeringInclude = {
  course: true,
  teacher: true,
  semester: true,
  classroom: true,
} satisfies Prisma.CourseOfferingInclude;

export function buildOfferingWhere(
  filters: OfferingFilters = {},
  scope?: AuthorizationScope
): Prisma.CourseOfferingWhereInput {
  const where: Prisma.CourseOfferingWhereInput = {};

  if (scope?.role === "Teacher") {
    where.teacherId = scope.teacherId;
  } else if (scope?.role === "Student") {
    where.enrollments = { some: { studentId: scope.studentId } };
  }

  if (filters.courseId) where.courseId = filters.courseId;
  if (filters.teacherId && scope?.role !== "Teacher") where.teacherId = filters.teacherId;
  if (filters.semesterId) where.semesterId = filters.semesterId;

  return where;
}
