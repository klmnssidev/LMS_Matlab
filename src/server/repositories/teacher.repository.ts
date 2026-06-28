import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";

export type TeacherFilters = {
  departmentId?: number;
  search?: string;
  limit?: number;
  offset?: number;
};

export async function findMany(filters: TeacherFilters) {
  const where: Prisma.TeacherWhereInput = {};

  if (filters.departmentId) {
    where.departmentId = filters.departmentId;
  }
  if (filters.search) {
    where.OR = [
      { teacherName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.teacher.findMany({
    where,
    include: { department: true },
    orderBy: { teacherName: "asc" },
    skip: filters.offset ?? 0,
    take: filters.limit ?? 20,
  });
}

export async function findById(id: number) {
  return prisma.teacher.findUnique({
    where: { teacherId: id },
    include: { department: true, courseOfferings: { include: { course: true, semester: true, classroom: true } } },
  });
}

export async function create(data: Prisma.TeacherCreateInput) {
  return prisma.teacher.create({ data });
}

export async function update(id: number, data: Prisma.TeacherUpdateInput) {
  return prisma.teacher.update({ where: { teacherId: id }, data });
}

export async function remove(id: number) {
  return prisma.teacher.delete({ where: { teacherId: id } });
}

export async function count(filters: Omit<TeacherFilters, "limit" | "offset">) {
  const where: Prisma.TeacherWhereInput = {};

  if (filters.departmentId) {
    where.departmentId = filters.departmentId;
  }
  if (filters.search) {
    where.OR = [
      { teacherName: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return prisma.teacher.count({ where });
}
