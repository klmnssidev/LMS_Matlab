import type { ExamResultJoined } from "@/server/schemas/exam-result.schema";

const BASE = "/api/exam-results";

export type ExamResultListResponse = {
  data: ExamResultJoined[];
  total: number;
};

export async function fetchExamResults(params?: { exam_id?: number; student_id?: number }): Promise<ExamResultListResponse> {
  const url = new URL(BASE, window.location.origin);
  if (params?.exam_id) url.searchParams.set("exam_id", String(params.exam_id));
  if (params?.student_id) url.searchParams.set("student_id", String(params.student_id));
  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch exam results" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function fetchExamResult(id: number): Promise<ExamResultJoined> {
  const res = await fetch(`${BASE}?id=${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch exam result" }));
    throw new Error(err.error ?? "Failed to fetch exam result");
  }
  return res.json();
}

export async function createExamResult(data: Record<string, unknown>): Promise<ExamResultJoined> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create exam result" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function updateExamResult(data: Record<string, unknown>): Promise<ExamResultJoined> {
  const res = await fetch(BASE, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to update exam result" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function deleteExamResult(id: number): Promise<void> {
  const res = await fetch(`${BASE}?id=${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to delete exam result" }));
    throw new Error(err.error);
  }
}
