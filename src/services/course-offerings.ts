import { db } from "@/lib/db";
import { z } from "zod";

export const CourseOfferingSchema = z.object({
  offering_id: z.number(),
  course_id: z.number(),
  teacher_id: z.number(),
  semester_id: z.number(),
  classroom_id: z.number(),
  section_name: z.string().max(10).default("A"),
  max_students: z.number().default(40),
});

export const CreateCourseOfferingSchema = CourseOfferingSchema.omit({ offering_id: true });

export type CourseOffering = z.infer<typeof CourseOfferingSchema>;
export type CreateCourseOffering = z.infer<typeof CreateCourseOfferingSchema>;

export const CourseOfferingJoinedSchema = CourseOfferingSchema.extend({
  course_code: z.string(),
  course_name: z.string(),
  teacher_name: z.string(),
  semester_name: z.string(),
  room_code: z.string(),
});

export type CourseOfferingJoined = z.infer<typeof CourseOfferingJoinedSchema>;

export async function listCourseOfferings(options?: {
  semester_id?: number;
  teacher_id?: number;
  course_id?: number;
}): Promise<CourseOfferingJoined[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (options?.semester_id) {
    conditions.push(`o.semester_id = $${idx++}`);
    params.push(options.semester_id);
  }
  if (options?.teacher_id) {
    conditions.push(`o.teacher_id = $${idx++}`);
    params.push(options.teacher_id);
  }
  if (options?.course_id) {
    conditions.push(`o.course_id = $${idx++}`);
    params.push(options.course_id);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT o.*, c.course_code, c.course_name, t.teacher_name, s.semester_name, cr.room_code
    FROM course_offerings o
    JOIN courses c ON c.course_id = o.course_id
    JOIN teachers t ON t.teacher_id = o.teacher_id
    JOIN semesters s ON s.semester_id = o.semester_id
    JOIN classrooms cr ON cr.classroom_id = o.classroom_id
    ${where}
    ORDER BY c.course_name, o.section_name
  `;
  const { rows } = await db.query(sql, params);
  return rows.map((r) => CourseOfferingJoinedSchema.parse(r));
}

export async function getCourseOffering(id: number): Promise<CourseOfferingJoined | null> {
  const { rows } = await db.query(
    `SELECT o.*, c.course_code, c.course_name, t.teacher_name, s.semester_name, cr.room_code
     FROM course_offerings o
     JOIN courses c ON c.course_id = o.course_id
     JOIN teachers t ON t.teacher_id = o.teacher_id
     JOIN semesters s ON s.semester_id = o.semester_id
     JOIN classrooms cr ON cr.classroom_id = o.classroom_id
     WHERE o.offering_id = $1`,
    [id]
  );
  return rows.length ? CourseOfferingJoinedSchema.parse(rows[0]) : null;
}

export async function createCourseOffering(data: CreateCourseOffering): Promise<CourseOffering> {
  const { rows } = await db.query(
    `INSERT INTO course_offerings (course_id, teacher_id, semester_id, classroom_id, section_name, max_students)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.course_id, data.teacher_id, data.semester_id, data.classroom_id, data.section_name, data.max_students]
  );
  return CourseOfferingSchema.parse(rows[0]);
}

export async function updateCourseOffering(id: number, data: Partial<CreateCourseOffering>): Promise<CourseOffering | null> {
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
    `UPDATE course_offerings SET ${fields.join(", ")} WHERE offering_id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? CourseOfferingSchema.parse(rows[0]) : null;
}

export async function deleteCourseOffering(id: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM course_offerings WHERE offering_id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
