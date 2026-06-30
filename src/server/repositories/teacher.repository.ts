import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type TeacherFilters = {
  departmentId?: number;
  search?: string;
  limit?: number;
  offset?: number;
};

function applyScope(scope?: AuthorizationScope): Prisma.TeacherWhereInput {
  if (scope?.role === "Teacher") {
    return { teacherId: scope.teacherId };
  }
  return {};
}

export async function findMany(filters: TeacherFilters, scope?: AuthorizationScope) {
  const where: Prisma.TeacherWhereInput = { ...applyScope(scope) };

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

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.teacher.findFirst({
    where: { teacherId: id, ...applyScope(scope) },
    include: { department: true },
  });
}

export async function findByEmail(email: string) {
  return prisma.teacher.findUnique({
    where: { email },
    include: { department: true },
  });
}

export async function findByEmployeeNumber(employeeNumber: string) {
  return prisma.teacher.findUnique({
    where: { employeeNumber },
    include: { department: true },
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

export async function count(filters: Omit<TeacherFilters, "limit" | "offset">, scope?: AuthorizationScope) {
  const where: Prisma.TeacherWhereInput = { ...applyScope(scope) };

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
