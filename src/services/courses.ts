import { db } from "@/lib/db";
import { z } from "zod";

export const CourseSchema = z.object({
  course_id: z.number(),
  department_id: z.number(),
  course_code: z.string().max(20),
  course_name: z.string().max(150),
  credit_hours: z.number().min(1).max(6),
});

export const CreateCourseSchema = CourseSchema.omit({ course_id: true });

export type Course = z.infer<typeof CourseSchema>;
export type CreateCourse = z.infer<typeof CreateCourseSchema>;

export const CourseWithDeptSchema = CourseSchema.extend({
  department_name: z.string(),
  department_code: z.string(),
});

export type CourseWithDept = z.infer<typeof CourseWithDeptSchema>;

export async function listCourses(options?: {
  department_id?: number;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<CourseWithDept[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (options?.department_id) {
    conditions.push(`c.department_id = $${idx++}`);
    params.push(options.department_id);
  }
  if (options?.search) {
    conditions.push(`(c.course_name ILIKE $${idx} OR c.course_code ILIKE $${idx})`);
    params.push(`%${options.search}%`);
    idx++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  let sql = `
    SELECT c.*, d.department_name, d.department_code
    FROM courses c
    JOIN departments d ON d.department_id = c.department_id
    ${where}
    ORDER BY c.course_name
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
  return rows.map((r) => CourseWithDeptSchema.parse(r));
}

export async function getCourse(id: number): Promise<CourseWithDept | null> {
  const { rows } = await db.query(
    `SELECT c.*, d.department_name, d.department_code
     FROM courses c
     JOIN departments d ON d.department_id = c.department_id
     WHERE c.course_id = $1`,
    [id]
  );
  return rows.length ? CourseWithDeptSchema.parse(rows[0]) : null;
}

export async function createCourse(data: CreateCourse): Promise<Course> {
  const { rows } = await db.query(
    `INSERT INTO courses (department_id, course_code, course_name, credit_hours)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.department_id, data.course_code, data.course_name, data.credit_hours]
  );
  return CourseSchema.parse(rows[0]);
}

export async function updateCourse(id: number, data: Partial<CreateCourse>): Promise<Course | null> {
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
    `UPDATE courses SET ${fields.join(", ")} WHERE course_id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? CourseSchema.parse(rows[0]) : null;
}

export async function deleteCourse(id: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM courses WHERE course_id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
