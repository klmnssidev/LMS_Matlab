import type { Poster } from "@/server/schemas/poster.schema";

const BASE = "/api/posters";

export async function fetchPosters(): Promise<Poster[]> {
  const res = await fetch(BASE);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch posters" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function uploadPoster(title: string, file: File): Promise<Poster> {
  const formData = new FormData();
  formData.set("title", title);
  formData.set("image", file);

  const res = await fetch(BASE, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function deletePoster(id: number): Promise<void> {
  const res = await fetch(`${BASE}?id=${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Delete failed" }));
    throw new Error(err.error);
  }
}
