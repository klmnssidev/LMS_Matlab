import { db } from "@/lib/db";
import { z } from "zod";
import { dateString } from "@/lib/zod-utils";

export const SemesterSchema = z.object({
  semester_id: z.number(),
  semester_name: z.string().max(50),
  academic_year: z.string().max(20),
  start_date: dateString(),
  end_date: dateString(),
});

export const CreateSemesterSchema = SemesterSchema.omit({ semester_id: true });

export type Semester = z.infer<typeof SemesterSchema>;
export type CreateSemester = z.infer<typeof CreateSemesterSchema>;

export async function listSemesters(): Promise<Semester[]> {
  const { rows } = await db.query("SELECT * FROM semesters ORDER BY start_date DESC");
  return rows.map((r) => SemesterSchema.parse(r));
}

export async function getSemester(id: number): Promise<Semester | null> {
  const { rows } = await db.query("SELECT * FROM semesters WHERE semester_id = $1", [id]);
  return rows.length ? SemesterSchema.parse(rows[0]) : null;
}

export async function createSemester(data: CreateSemester): Promise<Semester> {
  const { rows } = await db.query(
    `INSERT INTO semesters (semester_name, academic_year, start_date, end_date)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.semester_name, data.academic_year, data.start_date, data.end_date]
  );
  return SemesterSchema.parse(rows[0]);
}

export async function updateSemester(id: number, data: Partial<CreateSemester>): Promise<Semester | null> {
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
    `UPDATE semesters SET ${fields.join(", ")} WHERE semester_id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? SemesterSchema.parse(rows[0]) : null;
}

export async function deleteSemester(id: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM semesters WHERE semester_id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
