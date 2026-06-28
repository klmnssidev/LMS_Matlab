import { db } from "@/lib/db";
import { z } from "zod";

export const ExamResultSchema = z.object({
  result_id: z.number(),
  exam_id: z.number(),
  enrollment_id: z.number(),
  score: z.number(),
});

export const CreateExamResultSchema = ExamResultSchema.omit({ result_id: true });

export type ExamResult = z.infer<typeof ExamResultSchema>;
export type CreateExamResult = z.infer<typeof CreateExamResultSchema>;

export const ExamResultJoinedSchema = ExamResultSchema.extend({
  student_name: z.string(),
  exam_type: z.string(),
  max_score: z.number(),
});

export type ExamResultJoined = z.infer<typeof ExamResultJoinedSchema>;

export async function listExamResults(options?: {
  exam_id?: number;
  enrollment_id?: number;
  student_id?: number;
}): Promise<ExamResultJoined[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (options?.exam_id) {
    conditions.push(`r.exam_id = $${idx++}`);
    params.push(options.exam_id);
  }
  if (options?.enrollment_id) {
    conditions.push(`r.enrollment_id = $${idx++}`);
    params.push(options.enrollment_id);
  }
  if (options?.student_id) {
    conditions.push(`e.student_id = $${idx++}`);
    params.push(options.student_id);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT r.*, s.student_name, ex.exam_type, ex.max_score
    FROM exam_results r
    JOIN exams ex ON ex.exam_id = r.exam_id
    JOIN enrollments e ON e.enrollment_id = r.enrollment_id
    JOIN students s ON s.student_id = e.student_id
    ${where}
    ORDER BY ex.exam_date DESC, s.student_name
  `;
  const { rows } = await db.query(sql, params);
  return rows.map((r) => ExamResultJoinedSchema.parse(r));
}

export async function getExamResult(id: number): Promise<ExamResultJoined | null> {
  const { rows } = await db.query(
    `SELECT r.*, s.student_name, ex.exam_type, ex.max_score
     FROM exam_results r
     JOIN exams ex ON ex.exam_id = r.exam_id
     JOIN enrollments e ON e.enrollment_id = r.enrollment_id
     JOIN students s ON s.student_id = e.student_id
     WHERE r.result_id = $1`,
    [id]
  );
  return rows.length ? ExamResultJoinedSchema.parse(rows[0]) : null;
}

export async function createExamResult(data: CreateExamResult): Promise<ExamResult> {
  const { rows } = await db.query(
    `INSERT INTO exam_results (exam_id, enrollment_id, score)
     VALUES ($1, $2, $3) RETURNING *`,
    [data.exam_id, data.enrollment_id, data.score]
  );
  return ExamResultSchema.parse(rows[0]);
}

export async function updateExamResult(id: number, data: Partial<CreateExamResult>): Promise<ExamResult | null> {
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
    `UPDATE exam_results SET ${fields.join(", ")} WHERE result_id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? ExamResultSchema.parse(rows[0]) : null;
}

export async function deleteExamResult(id: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM exam_results WHERE result_id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
