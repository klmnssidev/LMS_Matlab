import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";

export type EnrollmentFilters = {
  studentId?: number;
  offeringId?: number;
  status?: string;
};

export async function findMany(filters: EnrollmentFilters) {
  const where: Prisma.EnrollmentWhereInput = {};

  if (filters.studentId) where.studentId = filters.studentId;
  if (filters.offeringId) where.offeringId = filters.offeringId;
  if (filters.status) where.status = filters.status;

  return prisma.enrollment.findMany({
    where,
    include: {
      student: true,
      offering: {
        include: {
          course: true,
          semester: true,
        },
      },
    },
    orderBy: { enrollmentDate: "desc" },
  });
}

export async function findById(id: number) {
  return prisma.enrollment.findUnique({
    where: { enrollmentId: id },
    include: {
      student: true,
      offering: {
        include: {
          course: true,
          semester: true,
        },
      },
    },
  });
}

export async function create(data: Prisma.EnrollmentCreateInput) {
  return prisma.enrollment.create({ data });
}

export async function update(id: number, data: Prisma.EnrollmentUpdateInput) {
  return prisma.enrollment.update({ where: { enrollmentId: id }, data });
}

export async function remove(id: number) {
  return prisma.enrollment.delete({ where: { enrollmentId: id } });
}

export async function count(filters: EnrollmentFilters) {
  const where: Prisma.EnrollmentWhereInput = {};

  if (filters.studentId) where.studentId = filters.studentId;
  if (filters.offeringId) where.offeringId = filters.offeringId;
  if (filters.status) where.status = filters.status;

  return prisma.enrollment.count({ where });
}
