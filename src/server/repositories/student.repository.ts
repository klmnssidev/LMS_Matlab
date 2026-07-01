import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";
import { studentInclude, buildStudentWhere } from "@/server/repositories/helpers/student-query.helper";
import type { StudentFilters } from "@/server/repositories/helpers/student-query.helper";

export type { StudentFilters };

export async function findMany(filters: StudentFilters, scope?: AuthorizationScope) {
  return prisma.student.findMany({
    where: buildStudentWhere(filters, scope),
    include: studentInclude,
    orderBy: { studentName: "asc" },
    skip: filters.offset ?? 0,
    take: filters.limit ?? 20,
  });
}

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.student.findFirst({
    where: { studentId: id, ...buildStudentWhere({}, scope) },
    include: studentInclude,
  });
}

export async function findByEmail(email: string) {
  return prisma.student.findUnique({
    where: { email },
    include: studentInclude,
  });
}

export async function findByStudentNumber(studentNumber: string) {
  return prisma.student.findUnique({
    where: { studentNumber },
    include: studentInclude,
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
  return prisma.student.count({ where: buildStudentWhere(filters, scope) });
}
