import * as studentRepo from "@/server/repositories/student.repository";
import type { StudentFilters } from "@/server/repositories/student.repository";
import type { CreateStudent, UpdateStudent, StudentWithDept } from "@/server/schemas/student.schema";
import type { AuthorizationScope } from "@/permissions";

function toStudentWithDept(row: Awaited<ReturnType<typeof studentRepo.findMany>>[number]): StudentWithDept {
  return {
    studentId: row.studentId,
    departmentId: row.departmentId,
    studentName: row.studentName,
    email: row.email,
    phone: row.phone,
    gender: row.gender as "Male" | "Female",
    dateOfBirth: row.dateOfBirth?.toISOString() ?? null,
    admissionYear: row.admissionYear,
    status: row.status as StudentWithDept["status"],
    departmentName: row.department.departmentName,
    departmentCode: row.department.departmentCode,
  };
}

export async function list(filters: StudentFilters, scope?: AuthorizationScope) {
  const rows = await studentRepo.findMany(filters, scope);
  return rows.map(toStudentWithDept);
}

export async function getById(id: number, scope?: AuthorizationScope) {
  const row = await studentRepo.findById(id, scope);
  if (!row) return null;
  return toStudentWithDept(row);
}

export async function create(data: CreateStudent) {
  const row = await studentRepo.create({
    studentName: data.studentName,
    email: data.email,
    phone: data.phone ?? null,
    gender: data.gender,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    admissionYear: data.admissionYear,
    status: data.status,
    department: { connect: { departmentId: data.departmentId } },
  });
  return row;
}

export async function update(id: number, data: UpdateStudent) {
  const updateData: Record<string, unknown> = {};
  if (data.studentName !== undefined) updateData.studentName = data.studentName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone ?? null;
  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
  if (data.admissionYear !== undefined) updateData.admissionYear = data.admissionYear;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.departmentId !== undefined) updateData.department = { connect: { departmentId: data.departmentId } };

  const row = await studentRepo.update(id, updateData);
  return row;
}

export async function remove(id: number) {
  return studentRepo.remove(id);
}

export async function count(filters: Omit<StudentFilters, "limit" | "offset">, scope?: AuthorizationScope) {
  return studentRepo.count(filters, scope);
}
