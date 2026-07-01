import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";
import { teacherInclude, buildTeacherWhere } from "@/server/repositories/helpers/teacher-query.helper";
import type { TeacherFilters } from "@/server/repositories/helpers/teacher-query.helper";

export type { TeacherFilters };

export async function findMany(filters: TeacherFilters, scope?: AuthorizationScope) {
  return prisma.teacher.findMany({
    where: buildTeacherWhere(filters, scope),
    include: teacherInclude,
    orderBy: { teacherName: "asc" },
    skip: filters.offset ?? 0,
    take: filters.limit ?? 20,
  });
}

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.teacher.findFirst({
    where: { teacherId: id, ...buildTeacherWhere({}, scope) },
    include: teacherInclude,
  });
}

export async function findByEmail(email: string) {
  return prisma.teacher.findUnique({
    where: { email },
    include: teacherInclude,
  });
}

export async function findByEmployeeNumber(employeeNumber: string) {
  return prisma.teacher.findUnique({
    where: { employeeNumber },
    include: teacherInclude,
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
  return prisma.teacher.count({ where: buildTeacherWhere(filters, scope) });
}
