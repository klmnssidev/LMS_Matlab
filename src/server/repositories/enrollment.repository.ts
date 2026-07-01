import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";
import { enrollmentInclude, buildEnrollmentWhere } from "@/server/repositories/helpers/enrollment-query.helper";
import type { EnrollmentFilters } from "@/server/repositories/helpers/enrollment-query.helper";

export type { EnrollmentFilters };

export async function findMany(filters: EnrollmentFilters, scope?: AuthorizationScope) {
  return prisma.enrollment.findMany({
    where: buildEnrollmentWhere(filters, scope),
    include: enrollmentInclude,
    orderBy: { enrollmentDate: "desc" },
  });
}

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.enrollment.findFirst({
    where: { enrollmentId: id, ...buildEnrollmentWhere({}, scope) },
    include: enrollmentInclude,
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
  return prisma.enrollment.count({ where: buildEnrollmentWhere(filters, scope) });
}

export async function findTranscriptEnrollments(
  studentId: number,
  semesterId?: number
) {
  const where: Prisma.EnrollmentWhereInput = {
    studentId,
    ...(semesterId ? { offering: { semesterId } } : {}),
  };

  return prisma.enrollment.findMany({
    where,
    include: {
      student: {
        include: { department: true },
      },
      offering: {
        include: {
          course: true,
          semester: true,
        },
      },
      examResults: {
        include: {
          exam: true,
        },
        orderBy: { exam: { examDate: "asc" } },
      },
    },
    orderBy: [
      { offering: { semester: { startDate: "asc" } } },
      { offering: { course: { courseName: "asc" } } },
    ],
  });
}
