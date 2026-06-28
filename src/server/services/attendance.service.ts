import * as attendanceRepo from "@/server/repositories/attendance.repository";
import type { AttendanceFilters } from "@/server/repositories/attendance.repository";
import type { CreateAttendance, UpdateAttendance, AttendanceJoined } from "@/server/schemas/attendance.schema";

function toAttendanceJoined(row: Awaited<ReturnType<typeof attendanceRepo.findMany>>[number]): AttendanceJoined {
  return {
    attendanceId: row.attendanceId,
    enrollmentId: row.enrollmentId,
    attendanceDate: row.attendanceDate.toISOString().split("T")[0],
    status: row.status as AttendanceJoined["status"],
    remarks: row.remarks,
    studentName: row.enrollment.student.studentName,
    courseName: row.enrollment.offering.course.courseName,
  };
}

export async function list(filters: AttendanceFilters) {
  const rows = await attendanceRepo.findMany(filters);
  return rows.map(toAttendanceJoined);
}

export async function getById(id: number) {
  const row = await attendanceRepo.findById(id);
  if (!row) return null;
  return toAttendanceJoined(row);
}

export async function create(data: CreateAttendance) {
  const row = await attendanceRepo.create({
    attendanceDate: new Date(data.attendanceDate),
    status: data.status,
    remarks: data.remarks ?? null,
    enrollment: { connect: { enrollmentId: data.enrollmentId } },
  });
  return row;
}

export async function update(id: number, data: UpdateAttendance) {
  const updateData: Record<string, unknown> = {};
  if (data.attendanceDate !== undefined) updateData.attendanceDate = new Date(data.attendanceDate);
  if (data.status !== undefined) updateData.status = data.status;
  if (data.remarks !== undefined) updateData.remarks = data.remarks ?? null;
  if (data.enrollmentId !== undefined) updateData.enrollment = { connect: { enrollmentId: data.enrollmentId } };

  const row = await attendanceRepo.update(id, updateData);
  return row;
}

export async function remove(id: number) {
  return attendanceRepo.remove(id);
}

export async function count(filters: AttendanceFilters) {
  return attendanceRepo.count(filters);
}
