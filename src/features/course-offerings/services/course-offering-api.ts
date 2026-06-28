import type { CourseOfferingJoined } from "@/server/schemas/course-offering.schema";

const BASE = "/api/course-offerings";

export type OfferingListResponse = {
  data: CourseOfferingJoined[];
  total: number;
};

export async function fetchOfferings(): Promise<OfferingListResponse> {
  const res = await fetch(BASE);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch offerings" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function fetchOffering(id: number): Promise<CourseOfferingJoined> {
  const res = await fetch(`${BASE}?id=${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch offering" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function createOffering(data: Record<string, unknown>): Promise<CourseOfferingJoined> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create offering" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function updateOffering(data: Record<string, unknown>): Promise<CourseOfferingJoined> {
  const res = await fetch(BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to update offering" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function deleteOffering(id: number): Promise<void> {
  const res = await fetch(`${BASE}?id=${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to delete offering" }));
    throw new Error(err.error);
  }
}
