import * as enrollmentRepo from "@/server/repositories/enrollment.repository";
import type { EnrollmentFilters } from "@/server/repositories/enrollment.repository";
import type { CreateEnrollment, UpdateEnrollment, EnrollmentJoined } from "@/server/schemas/enrollment.schema";

function toEnrollmentJoined(row: Awaited<ReturnType<typeof enrollmentRepo.findMany>>[number]): EnrollmentJoined {
  return {
    enrollmentId: row.enrollmentId,
    studentId: row.studentId,
    offeringId: row.offeringId,
    enrollmentDate: row.enrollmentDate.toISOString().split("T")[0],
    status: row.status as EnrollmentJoined["status"],
    finalGrade: row.finalGrade,
    studentName: row.student.studentName,
    courseName: row.offering.course.courseName,
    courseCode: row.offering.course.courseCode,
    sectionName: row.offering.sectionName,
    semesterName: row.offering.semester.semesterName,
  };
}

export async function list(filters: EnrollmentFilters) {
  const rows = await enrollmentRepo.findMany(filters);
  return rows.map(toEnrollmentJoined);
}

export async function getById(id: number) {
  const row = await enrollmentRepo.findById(id);
  if (!row) return null;
  return toEnrollmentJoined(row);
}

export async function create(data: CreateEnrollment) {
  const row = await enrollmentRepo.create({
    enrollmentDate: new Date(data.enrollmentDate),
    status: data.status,
    finalGrade: data.finalGrade ?? null,
    student: { connect: { studentId: data.studentId } },
    offering: { connect: { offeringId: data.offeringId } },
  });
  return row;
}

export async function update(id: number, data: UpdateEnrollment) {
  const updateData: Record<string, unknown> = {};
  if (data.enrollmentDate !== undefined) updateData.enrollmentDate = new Date(data.enrollmentDate);
  if (data.status !== undefined) updateData.status = data.status;
  if (data.finalGrade !== undefined) updateData.finalGrade = data.finalGrade ?? null;
  if (data.studentId !== undefined) updateData.student = { connect: { studentId: data.studentId } };
  if (data.offeringId !== undefined) updateData.offering = { connect: { offeringId: data.offeringId } };

  const row = await enrollmentRepo.update(id, updateData);
  return row;
}

export async function remove(id: number) {
  return enrollmentRepo.remove(id);
}

export async function count(filters: EnrollmentFilters) {
  return enrollmentRepo.count(filters);
}
