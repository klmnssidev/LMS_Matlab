import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";
import { courseInclude, courseDetailInclude, buildCourseWhere } from "@/server/repositories/helpers/course-query.helper";
import type { CourseFilters } from "@/server/repositories/helpers/course-query.helper";

export type { CourseFilters };

export async function findMany(filters: CourseFilters, scope?: AuthorizationScope) {
  return prisma.course.findMany({
    where: buildCourseWhere(filters, scope),
    include: courseInclude,
    orderBy: { courseName: "asc" },
    skip: filters.offset ?? 0,
    take: filters.limit ?? 50,
  });
}

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.course.findFirst({
    where: { courseId: id, ...buildCourseWhere({}, scope) },
    include: courseDetailInclude,
  });
}

export async function create(data: Prisma.CourseCreateInput) {
  return prisma.course.create({ data });
}

export async function update(id: number, data: Prisma.CourseUpdateInput) {
  return prisma.course.update({ where: { courseId: id }, data });
}

export async function remove(id: number) {
  return prisma.course.delete({ where: { courseId: id } });
}

export async function count(filters: Omit<CourseFilters, "limit" | "offset">, scope?: AuthorizationScope) {
  return prisma.course.count({ where: buildCourseWhere(filters, scope) });
}
