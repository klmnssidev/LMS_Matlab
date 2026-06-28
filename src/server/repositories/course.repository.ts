import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";

export type CourseFilters = {
  search?: string;
  limit?: number;
  offset?: number;
};

export async function findMany(filters: CourseFilters) {
  const where: Prisma.CourseWhereInput = {};

  if (filters.search) {
    where.OR = [
      { courseName: { contains: filters.search, mode: "insensitive" } },
      { courseCode: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.course.findMany({
    where,
    include: { department: true },
    orderBy: { courseName: "asc" },
    skip: filters.offset ?? 0,
    take: filters.limit ?? 50,
  });
}

export async function findById(id: number) {
  return prisma.course.findUnique({
    where: { courseId: id },
    include: {
      department: true,
      courseOfferings: {
        include: {
          teacher: true,
          semester: true,
          classroom: true,
        },
      },
    },
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

export async function count(filters: Omit<CourseFilters, "limit" | "offset">) {
  const where: Prisma.CourseWhereInput = {};

  if (filters.search) {
    where.OR = [
      { courseName: { contains: filters.search, mode: "insensitive" } },
      { courseCode: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.course.count({ where });
}
