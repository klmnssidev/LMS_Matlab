import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";

export type ExamResultFilters = {
  examId?: number;
  enrollmentId?: number;
  studentId?: number;
};

export async function findMany(filters: ExamResultFilters) {
  const where: Prisma.ExamResultWhereInput = {};

  if (filters.examId) where.examId = filters.examId;
  if (filters.enrollmentId) where.enrollmentId = filters.enrollmentId;

  return prisma.examResult.findMany({
    where: {
      ...where,
      ...(filters.studentId ? { enrollment: { studentId: filters.studentId } } : {}),
    },
    include: {
      exam: true,
      enrollment: { include: { student: true } },
    },
    orderBy: { resultId: "desc" },
  });
}

export async function findById(id: number) {
  return prisma.examResult.findUnique({
    where: { resultId: id },
    include: {
      exam: true,
      enrollment: { include: { student: true } },
    },
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

export async function count(filters: ExamResultFilters) {
  const where: Prisma.ExamResultWhereInput = {};

  if (filters.examId) where.examId = filters.examId;
  if (filters.enrollmentId) where.enrollmentId = filters.enrollmentId;

  return prisma.examResult.count({
    where: {
      ...where,
      ...(filters.studentId ? { enrollment: { studentId: filters.studentId } } : {}),
    },
  });
}
