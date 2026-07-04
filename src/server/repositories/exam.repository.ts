import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";
import { examInclude, buildExamWhere } from "@/server/repositories/helpers/exam-query.helper";
import type { ExamFilters } from "@/server/repositories/helpers/exam-query.helper";

export type { ExamFilters };

export async function findMany(filters: ExamFilters = {}, scope?: AuthorizationScope) {
  return prisma.exam.findMany({
    where: buildExamWhere(filters, scope),
    include: examInclude,
    orderBy: { examDate: "desc" },
  });
}

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.exam.findFirst({
    where: { examId: id, ...buildExamWhere({}, scope) },
    include: examInclude,
  });
}

export async function create(data: Prisma.ExamCreateInput) {
  return prisma.exam.create({
    data,
    include: { offering: { include: { course: true } } },
  });
}

export async function update(id: number, data: Prisma.ExamUpdateInput) {
  return prisma.exam.update({
    where: { examId: id },
    data,
    include: { offering: { include: { course: true } } },
  });
}

export async function remove(id: number) {
  return prisma.exam.delete({ where: { examId: id } });
}

export async function count(filters: ExamFilters = {}, scope?: AuthorizationScope) {
  return prisma.exam.count({ where: buildExamWhere(filters, scope) });
}
