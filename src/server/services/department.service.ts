import * as departmentRepo from "@/server/repositories/department.repository";
import type { Department } from "@/server/schemas/department.schema";

export async function list(): Promise<Department[]> {
  const departments = await departmentRepo.findAll();
  return departments.map((d) => ({
    departmentId: d.departmentId,
    departmentCode: d.departmentCode,
    departmentName: d.departmentName,
    facultyName: d.facultyName,
    createdAt: d.createdAt?.toISOString() ?? null,
  }));
}
