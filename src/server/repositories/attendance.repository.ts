import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type AttendanceFilters = {
  enrollmentId?: number;
  offeringId?: number;
  studentId?: number;
  startDate?: string;
  endDate?: string;
};

function applyScope(scope?: AuthorizationScope): Prisma.AttendanceWhereInput {
  if (scope?.role === "Teacher") {
    return { enrollment: { offering: { teacherId: scope.teacherId } } };
  }
  if (scope?.role === "Student") {
    return { enrollment: { studentId: scope.studentId } };
  }
  return {};
}

export async function findMany(filters: AttendanceFilters, scope?: AuthorizationScope) {
  const where: Prisma.AttendanceWhereInput = { ...applyScope(scope) };

  if (filters.enrollmentId) where.enrollmentId = filters.enrollmentId;
  if (filters.startDate || filters.endDate) {
    where.attendanceDate = {};
    if (filters.startDate) where.attendanceDate.gte = new Date(filters.startDate);
    if (filters.endDate) where.attendanceDate.lte = new Date(filters.endDate);
  }

  return prisma.attendance.findMany({
    where: {
      ...where,
      ...(filters.offeringId ? { enrollment: { offeringId: filters.offeringId } } : {}),
      ...(filters.studentId ? { enrollment: { studentId: filters.studentId } } : {}),
    },
    include: {
      enrollment: {
        include: {
          student: true,
          offering: { include: { course: true } },
        },
      },
    },
    orderBy: { attendanceDate: "desc" },
  });
}

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.attendance.findFirst({
    where: { attendanceId: id, ...applyScope(scope) },
    include: {
      enrollment: {
        include: {
          student: true,
          offering: { include: { course: true } },
        },
      },
    },
  });
}

export async function create(data: Prisma.AttendanceCreateInput) {
  return prisma.attendance.create({ data });
}

export async function update(id: number, data: Prisma.AttendanceUpdateInput) {
  return prisma.attendance.update({ where: { attendanceId: id }, data });
}

export async function remove(id: number) {
  return prisma.attendance.delete({ where: { attendanceId: id } });
}

export async function count(filters: AttendanceFilters, scope?: AuthorizationScope) {
  const where: Prisma.AttendanceWhereInput = { ...applyScope(scope) };

  if (filters.enrollmentId) where.enrollmentId = filters.enrollmentId;
  if (filters.startDate || filters.endDate) {
    where.attendanceDate = {};
    if (filters.startDate) where.attendanceDate.gte = new Date(filters.startDate);
    if (filters.endDate) where.attendanceDate.lte = new Date(filters.endDate);
  }

  return prisma.attendance.count({
    where: {
      ...where,
      ...(filters.offeringId ? { enrollment: { offeringId: filters.offeringId } } : {}),
      ...(filters.studentId ? { enrollment: { studentId: filters.studentId } } : {}),
    },
  });
}
