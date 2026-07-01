import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export type AttendanceFilters = {
  enrollmentId?: number;
  offeringId?: number;
  studentId?: number;
  startDate?: string;
  endDate?: string;
};

export const attendanceInclude = {
  enrollment: {
    include: {
      student: true,
      offering: { include: { course: true } },
    },
  },
} satisfies Prisma.AttendanceInclude;

export function buildAttendanceWhere(
  filters: AttendanceFilters,
  scope?: AuthorizationScope
): Prisma.AttendanceWhereInput {
  const where: Prisma.AttendanceWhereInput = {};

  if (scope?.role === "Teacher") {
    where.enrollment = { offering: { teacherId: scope.teacherId } };
  } else if (scope?.role === "Student") {
    where.enrollment = { studentId: scope.studentId };
  }

  if (filters.enrollmentId) where.enrollmentId = filters.enrollmentId;
  if (filters.startDate || filters.endDate) {
    where.attendanceDate = {};
    if (filters.startDate) where.attendanceDate.gte = new Date(filters.startDate);
    if (filters.endDate) where.attendanceDate.lte = new Date(filters.endDate);
  }
  if (filters.offeringId) {
    where.enrollment = { ...(where.enrollment as object), offeringId: filters.offeringId };
  }
  if (filters.studentId && scope?.role !== "Student") {
    where.enrollment = { ...(where.enrollment as object), studentId: filters.studentId };
  }

  return where;
}
