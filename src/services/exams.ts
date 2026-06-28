import { db } from "@/lib/db";
import { z } from "zod";
import { dateString } from "@/lib/zod-utils";

export const ExamSchema = z.object({
  exam_id: z.number(),
  offering_id: z.number(),
  exam_type: z.enum(["Quiz", "Midterm", "Final", "Project"]),
  exam_date: dateString(),
  max_score: z.number(),
});

export const CreateExamSchema = ExamSchema.omit({ exam_id: true });

export type Exam = z.infer<typeof ExamSchema>;
export type CreateExam = z.infer<typeof CreateExamSchema>;

export const ExamJoinedSchema = ExamSchema.extend({
  course_name: z.string(),
  course_code: z.string(),
  section_name: z.string(),
  semester_name: z.string(),
});

export type ExamJoined = z.infer<typeof ExamJoinedSchema>;

export async function listExams(options?: {
  offering_id?: number;
  semester_id?: number;
  teacher_id?: number;
}): Promise<ExamJoined[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (options?.offering_id) {
    conditions.push(`ex.offering_id = $${idx++}`);
    params.push(options.offering_id);
  }
  if (options?.semester_id) {
    conditions.push(`o.semester_id = $${idx++}`);
    params.push(options.semester_id);
  }
  if (options?.teacher_id) {
    conditions.push(`o.teacher_id = $${idx++}`);
    params.push(options.teacher_id);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT ex.*, c.course_name, c.course_code, o.section_name, s.semester_name
    FROM exams ex
    JOIN course_offerings o ON o.offering_id = ex.offering_id
    JOIN courses c ON c.course_id = o.course_id
    JOIN semesters s ON s.semester_id = o.semester_id
    ${where}
    ORDER BY ex.exam_date DESC
  `;
  const { rows } = await db.query(sql, params);
  return rows.map((r) => ExamJoinedSchema.parse(r));
}

export async function getExam(id: number): Promise<ExamJoined | null> {
  const { rows } = await db.query(
    `SELECT ex.*, c.course_name, c.course_code, o.section_name, s.semester_name
     FROM exams ex
     JOIN course_offerings o ON o.offering_id = ex.offering_id
     JOIN courses c ON c.course_id = o.course_id
     JOIN semesters s ON s.semester_id = o.semester_id
     WHERE ex.exam_id = $1`,
    [id]
  );
  return rows.length ? ExamJoinedSchema.parse(rows[0]) : null;
}

export async function createExam(data: CreateExam): Promise<Exam> {
  const { rows } = await db.query(
    `INSERT INTO exams (offering_id, exam_type, exam_date, max_score)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.offering_id, data.exam_type, data.exam_date, data.max_score]
  );
  return ExamSchema.parse(rows[0]);
}

export async function updateExam(id: number, data: Partial<CreateExam>): Promise<Exam | null> {
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
    `UPDATE exams SET ${fields.join(", ")} WHERE exam_id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? ExamSchema.parse(rows[0]) : null;
}

export async function deleteExam(id: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM exams WHERE exam_id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
