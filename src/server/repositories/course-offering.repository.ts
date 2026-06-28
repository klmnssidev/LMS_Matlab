import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";

export type OfferingFilters = {
  courseId?: number;
  teacherId?: number;
  semesterId?: number;
};

export async function findMany(filters: OfferingFilters) {
  const where: Prisma.CourseOfferingWhereInput = {};

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

export async function findById(id: number) {
  return prisma.courseOffering.findUnique({
    where: { offeringId: id },
    include: {
      course: true,
      teacher: true,
      semester: true,
      classroom: true,
    },
  });
}
