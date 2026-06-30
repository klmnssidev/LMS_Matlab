import * as teacherRepo from "@/server/repositories/teacher.repository";
import type { TeacherFilters } from "@/server/repositories/teacher.repository";
import type { CreateTeacher, UpdateTeacher, TeacherWithDept } from "@/server/schemas/teacher.schema";
import type { AuthorizationScope } from "@/permissions";

function toTeacherWithDept(row: Awaited<ReturnType<typeof teacherRepo.findMany>>[number]): TeacherWithDept {
  return {
    teacherId: row.teacherId,
    departmentId: row.departmentId,
    teacherName: row.teacherName,
    email: row.email,
    phone: row.phone,
    academicRank: row.academicRank,
    hireDate: row.hireDate.toISOString().split("T")[0],
    departmentName: row.department.departmentName,
    departmentCode: row.department.departmentCode,
  };
}

export async function list(filters: TeacherFilters, scope?: AuthorizationScope) {
  const rows = await teacherRepo.findMany(filters, scope);
  return rows.map(toTeacherWithDept);
}

export async function getById(id: number, scope?: AuthorizationScope) {
  const row = await teacherRepo.findById(id, scope);
  if (!row) return null;
  return toTeacherWithDept(row);
}

export async function create(data: CreateTeacher) {
  const row = await teacherRepo.create({
    teacherName: data.teacherName,
    email: data.email,
    phone: data.phone ?? null,
    academicRank: data.academicRank,
    hireDate: new Date(data.hireDate),
    department: { connect: { departmentId: data.departmentId } },
  });
  return row;
}

export async function update(id: number, data: UpdateTeacher) {
  const updateData: Record<string, unknown> = {};
  if (data.teacherName !== undefined) updateData.teacherName = data.teacherName;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone ?? null;
  if (data.academicRank !== undefined) updateData.academicRank = data.academicRank;
  if (data.hireDate !== undefined) updateData.hireDate = new Date(data.hireDate);
  if (data.departmentId !== undefined) updateData.department = { connect: { departmentId: data.departmentId } };

  const row = await teacherRepo.update(id, updateData);
  return row;
}

export async function remove(id: number) {
  return teacherRepo.remove(id);
}

export async function count(filters: Omit<TeacherFilters, "limit" | "offset">, scope?: AuthorizationScope) {
  return teacherRepo.count(filters, scope);
}
