import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";
import { examResultInclude, buildExamResultWhere } from "@/server/repositories/helpers/exam-result-query.helper";
import type { ExamResultFilters } from "@/server/repositories/helpers/exam-result-query.helper";

export type { ExamResultFilters };

export async function findMany(filters: ExamResultFilters, scope?: AuthorizationScope) {
  return prisma.examResult.findMany({
    where: buildExamResultWhere(filters, scope),
    include: examResultInclude,
    orderBy: { resultId: "desc" },
  });
}

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.examResult.findFirst({
    where: { resultId: id, ...buildExamResultWhere({}, scope) },
    include: examResultInclude,
  });
}

export async function create(data: Prisma.ExamResultCreateInput) {
  return prisma.examResult.create({ data });
}

export async function update(id: number, data: Prisma.ExamResultUpdateInput) {
  return prisma.examResult.update({ where: { resultId: id }, data });
}

export async function remove(id: number) {
  return prisma.examResult.delete({ where: { resultId: id } });
}

export async function count(filters: ExamResultFilters, scope?: AuthorizationScope) {
  return prisma.examResult.count({ where: buildExamResultWhere(filters, scope) });
}
