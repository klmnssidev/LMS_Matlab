import { db } from "@/lib/db";
import { z } from "zod";

export const ClassroomSchema = z.object({
  classroom_id: z.number(),
  room_code: z.string().max(20),
  building: z.string().max(100),
  capacity: z.number().min(1),
});

export const CreateClassroomSchema = ClassroomSchema.omit({ classroom_id: true });

export type Classroom = z.infer<typeof ClassroomSchema>;
export type CreateClassroom = z.infer<typeof CreateClassroomSchema>;

export async function listClassrooms(): Promise<Classroom[]> {
  const { rows } = await db.query("SELECT * FROM classrooms ORDER BY building, room_code");
  return rows.map((r) => ClassroomSchema.parse(r));
}

export async function getClassroom(id: number): Promise<Classroom | null> {
  const { rows } = await db.query("SELECT * FROM classrooms WHERE classroom_id = $1", [id]);
  return rows.length ? ClassroomSchema.parse(rows[0]) : null;
}

export async function createClassroom(data: CreateClassroom): Promise<Classroom> {
  const { rows } = await db.query(
    `INSERT INTO classrooms (room_code, building, capacity)
     VALUES ($1, $2, $3) RETURNING *`,
    [data.room_code, data.building, data.capacity]
  );
  return ClassroomSchema.parse(rows[0]);
}

export async function updateClassroom(id: number, data: Partial<CreateClassroom>): Promise<Classroom | null> {
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
    `UPDATE classrooms SET ${fields.join(", ")} WHERE classroom_id = $${idx} RETURNING *`,
    params
  );
  return rows.length ? ClassroomSchema.parse(rows[0]) : null;
}

export async function deleteClassroom(id: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM classrooms WHERE classroom_id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
