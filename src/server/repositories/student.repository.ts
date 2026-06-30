import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type StudentFilters = {
  departmentId?: number;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

function applyScope(scope?: AuthorizationScope): Prisma.StudentWhereInput {
  if (scope?.role === "Teacher") {
    return { enrollments: { some: { offering: { teacherId: scope.teacherId } } } };
  }
  if (scope?.role === "Student") {
    return { studentId: scope.studentId };
  }
  return {};
}

export async function findMany(filters: StudentFilters, scope?: AuthorizationScope) {
  const where: Prisma.StudentWhereInput = { ...applyScope(scope) };

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

  return prisma.student.findMany({
    where,
    include: { department: true },
    orderBy: { studentName: "asc" },
    skip: filters.offset ?? 0,
    take: filters.limit ?? 20,
  });
}

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.student.findFirst({
    where: { studentId: id, ...applyScope(scope) },
    include: { department: true },
  });
}

export async function findByEmail(email: string) {
  return prisma.student.findUnique({
    where: { email },
    include: { department: true },
  });
}

export async function findByStudentNumber(studentNumber: string) {
  return prisma.student.findUnique({
    where: { studentNumber },
    include: { department: true },
  });
}

export async function create(data: Prisma.StudentCreateInput) {
  return prisma.student.create({ data });
}

export async function update(id: number, data: Prisma.StudentUpdateInput) {
  return prisma.student.update({ where: { studentId: id }, data });
}

export async function remove(id: number) {
  return prisma.student.delete({ where: { studentId: id } });
}

export async function count(filters: Omit<StudentFilters, "limit" | "offset">, scope?: AuthorizationScope) {
  const where: Prisma.StudentWhereInput = { ...applyScope(scope) };

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

  return prisma.student.count({ where });
}
