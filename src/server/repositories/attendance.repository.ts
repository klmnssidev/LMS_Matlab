import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";
import { attendanceInclude, buildAttendanceWhere } from "@/server/repositories/helpers/attendance-query.helper";
import type { AttendanceFilters } from "@/server/repositories/helpers/attendance-query.helper";

export type { AttendanceFilters };

export async function findMany(filters: AttendanceFilters, scope?: AuthorizationScope) {
  return prisma.attendance.findMany({
    where: buildAttendanceWhere(filters, scope),
    include: attendanceInclude,
    orderBy: { attendanceDate: "desc" },
  });
}

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.attendance.findFirst({
    where: { attendanceId: id, ...buildAttendanceWhere({}, scope) },
    include: attendanceInclude,
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
  return prisma.attendance.count({ where: buildAttendanceWhere(filters, scope) });
}
