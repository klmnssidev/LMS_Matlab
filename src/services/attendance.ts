import { db } from "@/lib/db";
import { z } from "zod";
import { dateString } from "@/lib/zod-utils";

export const AttendanceSchema = z.object({
  attendance_id: z.number(),
  enrollment_id: z.number(),
  attendance_date: dateString(),
  status: z.enum(["Present", "Absent", "Late", "Excused"]),
  remarks: z.string().max(255).nullable(),
});

export const CreateAttendanceSchema = AttendanceSchema.omit({ attendance_id: true });

export type Attendance = z.infer<typeof AttendanceSchema>;
export type CreateAttendance = z.infer<typeof CreateAttendanceSchema>;

export const AttendanceJoinedSchema = AttendanceSchema.extend({
  student_name: z.string(),
  course_name: z.string(),
});

export type AttendanceJoined = z.infer<typeof AttendanceJoinedSchema>;

export async function listAttendance(options?: {
  enrollment_id?: number;
  offering_id?: number;
  student_id?: number;
  start_date?: string;
  end_date?: string;
}): Promise<AttendanceJoined[]> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  if (options?.enrollment_id) {
    conditions.push(`a.enrollment_id = $${idx++}`);
    params.push(options.enrollment_id);
  }
  if (options?.offering_id) {
    conditions.push(`o.offering_id = $${idx++}`);
    params.push(options.offering_id);
  }
  if (options?.student_id) {
    conditions.push(`e.student_id = $${idx++}`);
    params.push(options.student_id);
  }
  if (options?.start_date) {
    conditions.push(`a.attendance_date >= $${idx++}`);
    params.push(options.start_date);
  }
  if (options?.end_date) {
    conditions.push(`a.attendance_date <= $${idx++}`);
    params.push(options.end_date);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT a.*, s.student_name, c.course_name
    FROM attendance a
    JOIN enrollments e ON e.enrollment_id = a.enrollment_id
    JOIN students s ON s.student_id = e.student_id
    JOIN course_offerings o ON o.offering_id = e.offering_id
    JOIN courses c ON c.course_id = o.course_id
    ${where}
    ORDER BY a.attendance_date DESC, s.student_name
  `;
  const { rows } = await db.query(sql, params);
  return rows.map((r) => AttendanceJoinedSchema.parse(r));
}

export async function getAttendance(id: number): Promise<AttendanceJoined | null> {
  const { rows } = await db.query(
    `SELECT a.*, s.student_name, c.course_name
     FROM attendance a
     JOIN enrollments e ON e.enrollment_id = a.enrollment_id
     JOIN students s ON s.student_id = e.student_id
     JOIN course_offerings o ON o.offering_id = e.offering_id
     JOIN courses c ON c.course_id = o.course_id
     WHERE a.attendance_id = $1`,
    [id]
  );
  return rows.length ? AttendanceJoinedSchema.parse(rows[0]) : null;
}

export async function createAttendance(data: CreateAttendance): Promise<Attendance> {
  const { rows } = await db.query(
    `INSERT INTO attendance (enrollment_id, attendance_date, status, remarks)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [data.enrollment_id, data.attendance_date, data.status, data.remarks]
  );
  return AttendanceSchema.parse(rows[0]);
}

export async function updateAttendance(id: number, data: Partial<CreateAttendance>): Promise<Attendance | null> {
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
    `UPDATE attendance SET ${fields.join(", ")} WHERE attendance_id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? AttendanceSchema.parse(rows[0]) : null;
}

export async function deleteAttendance(id: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM attendance WHERE attendance_id = $1", [id]);
  return (rowCount ?? 0) > 0;
}

