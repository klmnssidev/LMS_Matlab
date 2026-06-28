import * as posterRepo from "@/server/repositories/poster.repository";
import type { Poster, PosterFull } from "@/server/schemas/poster.schema";

export async function list(): Promise<Poster[]> {
  const rows = await posterRepo.findMany();
  return rows.map((r) => ({
    posterId: r.posterId,
    title: r.title,
    createdAt: r.createdAt?.toISOString() ?? null,
  }));
}

export async function getById(id: number): Promise<PosterFull | null> {
  const row = await posterRepo.findById(id);
  if (!row) return null;
  return {
    posterId: row.posterId,
    title: row.title,
    createdAt: row.createdAt?.toISOString() ?? null,
    imageData: row.imageData,
  };
}

export async function create(title: string, imageData: Uint8Array) {
  const row = await posterRepo.create(title, imageData);
  return {
    posterId: row.posterId,
    title: row.title,
    createdAt: row.createdAt?.toISOString() ?? null,
  };
}

export async function remove(id: number) {
  return posterRepo.remove(id);
}
