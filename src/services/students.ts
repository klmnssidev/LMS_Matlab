import { db } from "@/lib/db";
import { z } from "zod";

export const StudentSchema = z.object({
  student_id: z.number(),
  department_id: z.number(),
  student_name: z.string().max(120),
  email: z.string().max(120).email(),
  phone: z.string().max(30).nullable(),
  gender: z.enum(["Male", "Female"]),
  date_of_birth: z.string().nullable(),
  admission_year: z.number(),
  status: z.enum(["Active", "Graduated", "Suspended", "Withdrawn"]).default("Active"),
});

export const CreateStudentSchema = StudentSchema.omit({ student_id: true });
export const UpdateStudentSchema = CreateStudentSchema.partial();

export type Student = z.infer<typeof StudentSchema>;
export type CreateStudent = z.infer<typeof CreateStudentSchema>;
export type UpdateStudent = z.infer<typeof UpdateStudentSchema>;

export const StudentWithDeptSchema = StudentSchema.extend({
  department_name: z.string(),
  department_code: z.string(),
});

export type StudentWithDept = z.infer<typeof StudentWithDeptSchema>;

export async function listStudents(options?: {
  department_id?: number;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<StudentWithDept[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (options?.department_id) {
    conditions.push(`s.department_id = $${idx++}`);
    params.push(options.department_id);
  }
  if (options?.status) {
    conditions.push(`s.status = $${idx++}`);
    params.push(options.status);
  }
  if (options?.search) {
    conditions.push(`(s.student_name ILIKE $${idx} OR s.email ILIKE $${idx})`);
    params.push(`%${options.search}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  let sql = `
    SELECT s.*, d.department_name, d.department_code
    FROM students s
    JOIN departments d ON d.department_id = s.department_id
    ${where}
    ORDER BY s.student_name
  `;
  if (options?.limit) {
    sql += ` LIMIT $${idx++}`;
    params.push(options.limit);
  }
  if (options?.offset) {
    sql += ` OFFSET $${idx++}`;
    params.push(options.offset);
  }

  const { rows } = await db.query(sql, params);
  return rows.map((r) => StudentWithDeptSchema.parse(r));
}

export async function getStudent(id: number): Promise<StudentWithDept | null> {
  const { rows } = await db.query(
    `SELECT s.*, d.department_name, d.department_code
     FROM students s
     JOIN departments d ON d.department_id = s.department_id
     WHERE s.student_id = $1`,
    [id]
  );
  return rows.length ? StudentWithDeptSchema.parse(rows[0]) : null;
}

export async function createStudent(data: CreateStudent): Promise<Student> {
  const { rows } = await db.query(
    `INSERT INTO students (department_id, student_name, email, phone, gender, date_of_birth, admission_year, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [data.department_id, data.student_name, data.email, data.phone, data.gender, data.date_of_birth, data.admission_year, data.status]
  );
  return StudentSchema.parse(rows[0]);
}

export async function updateStudent(id: number, data: UpdateStudent): Promise<Student | null> {
  const fields: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      fields.push(`${key} = $${idx++}`);
      params.push(value);
    }
  }

  if (!fields.length) return getStudent(id);

  params.push(id);
  const { rows } = await db.query(
    `UPDATE students SET ${fields.join(", ")} WHERE student_id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? StudentSchema.parse(rows[0]) : null;
}

export async function deleteStudent(id: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM students WHERE student_id = $1", [id]);
  return (rowCount ?? 0) > 0;
}

export async function countStudents(department_id?: number): Promise<number> {
  if (department_id) {
    const { rows } = await db.query("SELECT COUNT(*) as count FROM students WHERE department_id = $1", [department_id]);
    return Number(rows[0].count);
  }
  const { rows } = await db.query("SELECT COUNT(*) as count FROM students");
  return Number(rows[0].count);
}
