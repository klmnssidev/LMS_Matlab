import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type EnrollmentFilters = {
  studentId?: number;
  offeringId?: number;
  status?: string;
};

function applyScope(scope?: AuthorizationScope): Prisma.EnrollmentWhereInput {
  if (scope?.role === "Teacher") {
    return { offering: { teacherId: scope.teacherId } };
  }
  if (scope?.role === "Student") {
    return { studentId: scope.studentId };
  }
  return {};
}

export async function findMany(filters: EnrollmentFilters, scope?: AuthorizationScope) {
  const where: Prisma.EnrollmentWhereInput = { ...applyScope(scope) };

  if (filters.studentId) where.studentId = filters.studentId;
  if (filters.offeringId) where.offeringId = filters.offeringId;
  if (filters.status) where.status = filters.status;

  return prisma.enrollment.findMany({
    where,
    include: {
      student: true,
      offering: {
        include: {
          course: { include: { department: true } },
          semester: true,
          teacher: true,
        },
      },
    },
    orderBy: { enrollmentDate: "desc" },
  });
}

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.enrollment.findFirst({
    where: { enrollmentId: id, ...applyScope(scope) },
    include: {
      student: true,
      offering: {
        include: {
          course: { include: { department: true } },
          semester: true,
          teacher: true,
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

export async function count(filters: EnrollmentFilters, scope?: AuthorizationScope) {
  const where: Prisma.EnrollmentWhereInput = { ...applyScope(scope) };

  if (filters.studentId) where.studentId = filters.studentId;
  if (filters.offeringId) where.offeringId = filters.offeringId;
  if (filters.status) where.status = filters.status;

  return prisma.enrollment.count({ where });
}
