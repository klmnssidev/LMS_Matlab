import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type OfferingFilters = {
  courseId?: number;
  teacherId?: number;
  semesterId?: number;
};

function applyScope(scope?: AuthorizationScope): Prisma.CourseOfferingWhereInput {
  if (scope?.role === "Teacher") {
    return { teacherId: scope.teacherId };
  }
  if (scope?.role === "Student") {
    return { enrollments: { some: { studentId: scope.studentId } } };
  }
  return {};
}

export async function findMany(filters: OfferingFilters = {}, scope?: AuthorizationScope) {
  const where: Prisma.CourseOfferingWhereInput = { ...applyScope(scope) };

  if (filters.courseId) where.courseId = filters.courseId;
  if (filters.teacherId) where.teacherId = filters.teacherId;
  if (filters.semesterId) where.semesterId = filters.semesterId;

  return prisma.courseOffering.findMany({
    where,
    include: {
      course: true,
      teacher: true,
      semester: true,
      classroom: true,
    },
    orderBy: [{ course: { courseName: "asc" } }, { sectionName: "asc" }],
  });
}

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.courseOffering.findFirst({
    where: { offeringId: id, ...applyScope(scope) },
    include: {
      course: true,
      teacher: true,
      semester: true,
      classroom: true,
    },
  });
}

export async function create(data: Prisma.CourseOfferingCreateInput) {
  return prisma.courseOffering.create({ data });
}

export async function update(id: number, data: Prisma.CourseOfferingUpdateInput) {
  return prisma.courseOffering.update({ where: { offeringId: id }, data });
}

export async function remove(id: number) {
  return prisma.courseOffering.delete({ where: { offeringId: id } });
}

export async function count(filters: OfferingFilters = {}, scope?: AuthorizationScope) {
  const where: Prisma.CourseOfferingWhereInput = { ...applyScope(scope) };

  if (filters.courseId) where.courseId = filters.courseId;
  if (filters.teacherId) where.teacherId = filters.teacherId;
  if (filters.semesterId) where.semesterId = filters.semesterId;

  return prisma.courseOffering.count({ where });
}
