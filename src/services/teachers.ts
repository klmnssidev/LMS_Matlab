import { db } from "@/lib/db";
import { z } from "zod";

export const TeacherSchema = z.object({
  teacher_id: z.number(),
  department_id: z.number(),
  teacher_name: z.string().max(120),
  email: z.string().max(120).email(),
  phone: z.string().max(30).nullable(),
  academic_rank: z.string().max(50),
  hire_date: z.string(),
});

export const CreateTeacherSchema = TeacherSchema.omit({ teacher_id: true });
export const UpdateTeacherSchema = CreateTeacherSchema.partial();

export type Teacher = z.infer<typeof TeacherSchema>;
export type CreateTeacher = z.infer<typeof CreateTeacherSchema>;
export type UpdateTeacher = z.infer<typeof UpdateTeacherSchema>;

export async function listTeachers(options?: {
  department_id?: number;
}): Promise<Teacher[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (options?.department_id) {
    conditions.push(`department_id = $${idx++}`);
    params.push(options.department_id);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await db.query(
    `SELECT * FROM teachers ${where} ORDER BY teacher_name`,
    params
  );
  return rows.map((r) => TeacherSchema.parse(r));
}

export async function getTeacher(id: number): Promise<Teacher | null> {
  const { rows } = await db.query("SELECT * FROM teachers WHERE teacher_id = $1", [id]);
  return rows.length ? TeacherSchema.parse(rows[0]) : null;
}

export async function createTeacher(data: CreateTeacher): Promise<Teacher> {
  const { rows } = await db.query(
    `INSERT INTO teachers (department_id, teacher_name, email, phone, academic_rank, hire_date)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.department_id, data.teacher_name, data.email, data.phone, data.academic_rank, data.hire_date]
  );
  return TeacherSchema.parse(rows[0]);
}

export async function updateTeacher(id: number, data: UpdateTeacher): Promise<Teacher | null> {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx++}`);
      params.push(value);
    }
  }

  if (!fields.length) return getTeacher(id);

  params.push(id);
  const { rows } = await db.query(
    `UPDATE teachers SET ${fields.join(", ")} WHERE teacher_id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? TeacherSchema.parse(rows[0]) : null;
}

export async function deleteTeacher(id: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM teachers WHERE teacher_id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
