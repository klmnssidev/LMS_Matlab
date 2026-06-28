import { db } from "@/lib/db";
import { z } from "zod";

export const PosterSchema = z.object({
  poster_id: z.number(),
  title: z.string().max(200),
  created_at: z.string().nullable(),
});

export const PosterFullSchema = PosterSchema.extend({
  image_data: z.any(),
});

export type Poster = z.infer<typeof PosterSchema>;
export type PosterFull = z.infer<typeof PosterFullSchema>;

export const CreatePosterSchema = z.object({
  title: z.string().min(1).max(200),
  image_data: z.instanceof(Buffer),
});

export type CreatePoster = z.infer<typeof CreatePosterSchema>;

export async function listPosters(): Promise<Poster[]> {
  const { rows } = await db.query("SELECT poster_id, title, created_at FROM posters ORDER BY created_at DESC");
  return rows.map((r) => PosterSchema.parse(r));
}

export async function getPoster(id: number): Promise<PosterFull | null> {
  const { rows } = await db.query("SELECT * FROM posters WHERE poster_id = $1", [id]);
  return rows.length ? PosterFullSchema.parse(rows[0]) : null;
}

export async function createPoster(data: CreatePoster): Promise<Poster> {
  const { rows } = await db.query(
    `INSERT INTO posters (title, image_data)
     VALUES ($1, $2)
     RETURNING poster_id, title, created_at`,
    [data.title, data.image_data]
  );
  return PosterSchema.parse(rows[0]);
}

export async function deletePoster(id: number): Promise<boolean> {
  const { rowCount } = await db.query("DELETE FROM posters WHERE poster_id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
