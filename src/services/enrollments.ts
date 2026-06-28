import { db } from "@/lib/db";
import { z } from "zod";
import { dateString } from "@/lib/zod-utils";

export const EnrollmentSchema = z.object({
  enrollment_id: z.number(),
  student_id: z.number(),
  offering_id: z.number(),
  enrollment_date: dateString(),
  status: z.enum(["Active", "Completed", "Dropped"]).default("Active"),
  final_grade: z.string().max(5).nullable(),
});

export const CreateEnrollmentSchema = EnrollmentSchema.omit({ enrollment_id: true });

export type Enrollment = z.infer<typeof EnrollmentSchema>;
export type CreateEnrollment = z.infer<typeof CreateEnrollmentSchema>;

export const EnrollmentJoinedSchema = EnrollmentSchema.extend({
  student_name: z.string(),
  course_name: z.string(),
  course_code: z.string(),
  section_name: z.string(),
  semester_name: z.string(),
});

export type EnrollmentJoined = z.infer<typeof EnrollmentJoinedSchema>;

export async function listEnrollments(options?: {
  student_id?: number;
  offering_id?: number;
  status?: string;
}): Promise<EnrollmentJoined[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (options?.student_id) {
    conditions.push(`e.student_id = $${idx++}`);
    params.push(options.student_id);
  }
  if (options?.offering_id) {
    conditions.push(`e.offering_id = $${idx++}`);
    params.push(options.offering_id);
  }
  if (options?.status) {
    conditions.push(`e.status = $${idx++}`);
    params.push(options.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT e.*, s.student_name, c.course_name, c.course_code, o.section_name, sem.semester_name
    FROM enrollments e
    JOIN students s ON s.student_id = e.student_id
    JOIN course_offerings o ON o.offering_id = e.offering_id
    JOIN courses c ON c.course_id = o.course_id
    JOIN semesters sem ON sem.semester_id = o.semester_id
    ${where}
    ORDER BY sem.start_date DESC, c.course_name
  `;
  const { rows } = await db.query(sql, params);
  return rows.map((r) => EnrollmentJoinedSchema.parse(r));
}

export async function getEnrollment(id: number): Promise<EnrollmentJoined | null> {
  const { rows } = await db.query(
    `SELECT e.*, s.student_name, c.course_name, c.course_code, o.section_name, sem.semester_name
     FROM enrollments e
     JOIN students s ON s.student_id = e.student_id
     JOIN course_offerings o ON o.offering_id = e.offering_id
     JOIN courses c ON c.course_id = o.course_id
     JOIN semesters sem ON sem.semester_id = o.semester_id
     WHERE e.enrollment_id = $1`,
    [id]
  );
  return rows.length ? EnrollmentJoinedSchema.parse(rows[0]) : null;
}

export async function createEnrollment(data: CreateEnrollment): Promise<Enrollment> {
  const { rows } = await db.query(
    `INSERT INTO enrollments (student_id, offering_id, enrollment_date, status, final_grade)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.student_id, data.offering_id, data.enrollment_date, data.status, data.final_grade]
  );
  return EnrollmentSchema.parse(rows[0]);
}

export async function updateEnrollment(id: number, data: Partial<CreateEnrollment>): Promise<Enrollment | null> {
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
    `UPDATE enrollments SET ${fields.join(", ")} WHERE enrollment_id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? EnrollmentSchema.parse(rows[0]) : null;
}

export async function deleteEnrollment(id: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM enrollments WHERE enrollment_id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
