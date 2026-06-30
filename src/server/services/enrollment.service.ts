import * as enrollmentRepo from "@/server/repositories/enrollment.repository";
import * as studentRepo from "@/server/repositories/student.repository";
import * as courseOfferingRepo from "@/server/repositories/course-offering.repository";
import type { EnrollmentFilters } from "@/server/repositories/enrollment.repository";
import type { CreateEnrollment, UpdateEnrollment, EnrollmentJoined } from "@/server/schemas/enrollment.schema";
import type { AuthorizationScope } from "@/permissions";
import { ForbiddenError } from "@/permissions/errors";

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
    teacherName: row.offering.teacher.teacherName,
    creditHours: row.offering.course.creditHours,
    departmentName: row.offering.course.department.departmentName,
  };
}

export async function list(filters: EnrollmentFilters, scope?: AuthorizationScope) {
  const rows = await enrollmentRepo.findMany(filters, scope);
  return rows.map(toEnrollmentJoined);
}

export async function getById(id: number, scope?: AuthorizationScope) {
  const row = await enrollmentRepo.findById(id, scope);
  if (!row) return null;
  return toEnrollmentJoined(row);
}

export async function create(data: CreateEnrollment) {
  const [student, offering] = await Promise.all([
    studentRepo.findById(data.studentId),
    courseOfferingRepo.findById(data.offeringId),
  ]);

  if (!student) throw new Error("Student not found");
  if (!offering) throw new Error("Course offering not found");

  if (student.departmentId !== offering.course.departmentId) {
    throw new ForbiddenError("Course does not belong to student's department");
  }

  const row = await enrollmentRepo.create({
    enrollmentDate: new Date(data.enrollmentDate),
    status: data.status,
    finalGrade: data.finalGrade ?? null,
    student: { connect: { studentId: data.studentId } },
    offering: { connect: { offeringId: data.offeringId } },
  });
  return row;
}

export async function update(id: number, data: UpdateEnrollment, scope?: AuthorizationScope) {
  const existing = await enrollmentRepo.findById(id, scope);
  if (!existing) return null;

  const updateData: Record<string, unknown> = {};
  if (data.enrollmentDate !== undefined) updateData.enrollmentDate = new Date(data.enrollmentDate);
  if (data.status !== undefined) updateData.status = data.status;
  if (data.finalGrade !== undefined) updateData.finalGrade = data.finalGrade ?? null;
  if (data.studentId !== undefined) updateData.student = { connect: { studentId: data.studentId } };
  if (data.offeringId !== undefined) updateData.offering = { connect: { offeringId: data.offeringId } };

  const row = await enrollmentRepo.update(id, updateData);
  return row;
}

export async function remove(id: number, scope?: AuthorizationScope) {
  const existing = await enrollmentRepo.findById(id, scope);
  if (!existing) return null;
  return enrollmentRepo.remove(id);
}

export async function count(filters: EnrollmentFilters, scope?: AuthorizationScope) {
  return enrollmentRepo.count(filters, scope);
}
