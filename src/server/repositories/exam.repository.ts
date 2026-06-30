import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type ExamFilters = {
  offeringId?: number;
};

function applyScope(scope?: AuthorizationScope): Prisma.ExamWhereInput {
  if (scope?.role === "Teacher") {
    return { offering: { teacherId: scope.teacherId } };
  }
  if (scope?.role === "Student") {
    return { offering: { enrollments: { some: { studentId: scope.studentId } } } };
  }
  return {};
}

export async function findMany(filters: ExamFilters = {}, scope?: AuthorizationScope) {
  const where: Prisma.ExamWhereInput = { ...applyScope(scope) };

  if (filters.offeringId) where.offeringId = filters.offeringId;

  return prisma.exam.findMany({
    where,
    include: { offering: { include: { course: true } } },
    orderBy: { examDate: "desc" },
  });
}

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.exam.findFirst({
    where: { examId: id, ...applyScope(scope) },
    include: { offering: { include: { course: true } } },
  });
}

export async function create(data: Prisma.ExamCreateInput) {
  return prisma.exam.create({ data });
}

export async function update(id: number, data: Prisma.ExamUpdateInput) {
  return prisma.exam.update({ where: { examId: id }, data });
}

export async function remove(id: number) {
  return prisma.exam.delete({ where: { examId: id } });
}

export async function count(filters: ExamFilters = {}, scope?: AuthorizationScope) {
  const where: Prisma.ExamWhereInput = { ...applyScope(scope) };

  if (filters.offeringId) where.offeringId = filters.offeringId;

  return prisma.exam.count({ where });
}
