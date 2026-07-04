import type { ExamJoined } from "@/server/schemas/exam.schema";

const BASE = "/api/exams";

export async function fetchExams(params?: { offering_id?: number }): Promise<ExamJoined[]> {
  const url = new URL(BASE, window.location.origin);
  if (params?.offering_id) url.searchParams.set("offering_id", String(params.offering_id));
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch exams" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function fetchExam(id: number): Promise<ExamJoined> {
  const res = await fetch(`${BASE}?id=${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch exam" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function createExam(data: Record<string, unknown>): Promise<ExamJoined> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create exam" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function updateExam(data: Record<string, unknown>): Promise<ExamJoined> {
  const res = await fetch(BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to update exam" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function deleteExam(id: number): Promise<void> {
  const res = await fetch(`${BASE}?id=${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to delete exam" }));
    throw new Error(err.error);
  }
}
