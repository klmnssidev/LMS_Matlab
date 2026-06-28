import { db } from "@/lib/db";
import { z } from "zod";
import { dateStringNullable } from "@/lib/zod-utils";

export const DepartmentSchema = z.object({
  department_id: z.number(),
  department_code: z.string().max(10),
  department_name: z.string().max(100),
  faculty_name: z.string().max(100),
  created_at: dateStringNullable(),
});

export const CreateDepartmentSchema = DepartmentSchema.omit({ department_id: true, created_at: true });

export type Department = z.infer<typeof DepartmentSchema>;
export type CreateDepartment = z.infer<typeof CreateDepartmentSchema>;

export async function listDepartments(): Promise<Department[]> {
  const { rows } = await db.query("SELECT * FROM departments ORDER BY department_name");
  return rows.map((r) => DepartmentSchema.parse(r));
}

export async function getDepartment(id: number): Promise<Department | null> {
  const { rows } = await db.query("SELECT * FROM departments WHERE department_id = $1", [id]);
  return rows.length ? DepartmentSchema.parse(rows[0]) : null;
}

export async function createDepartment(data: CreateDepartment): Promise<Department> {
  const { rows } = await db.query(
    `INSERT INTO departments (department_code, department_name, faculty_name)
     VALUES ($1, $2, $3) RETURNING *`,
    [data.department_code, data.department_name, data.faculty_name]
  );
  return DepartmentSchema.parse(rows[0]);
}

export async function updateDepartment(id: number, data: Partial<CreateDepartment>): Promise<Department | null> {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx++}`);
      params.push(value);
    }
  }

  if (!fields.length) return null;

  params.push(id);
  const { rows } = await db.query(
    `UPDATE departments SET ${fields.join(", ")} WHERE department_id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? DepartmentSchema.parse(rows[0]) : null;
}

export async function deleteDepartment(id: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM departments WHERE department_id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
