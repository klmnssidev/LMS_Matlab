import type { EnrollmentJoined } from "@/server/schemas/enrollment.schema";

const BASE = "/api/enrollments";

export type EnrollmentListParams = {
  student_id?: number;
  offering_id?: number;
  status?: string;
};

export type EnrollmentListResponse = {
  data: EnrollmentJoined[];
  total: number;
};

export async function fetchEnrollments(params: EnrollmentListParams = {}): Promise<EnrollmentListResponse> {
  const url = new URL(BASE, window.location.origin);
  if (params.student_id) url.searchParams.set("student_id", String(params.student_id));
  if (params.offering_id) url.searchParams.set("offering_id", String(params.offering_id));
  if (params.status) url.searchParams.set("status", params.status);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch enrollments" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function createEnrollment(data: Record<string, unknown>): Promise<EnrollmentJoined> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create enrollment" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function updateEnrollment(data: Record<string, unknown>): Promise<EnrollmentJoined> {
  const res = await fetch(BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to update enrollment" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function deleteEnrollment(id: number): Promise<void> {
  const res = await fetch(`${BASE}?id=${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to delete enrollment" }));
    throw new Error(err.error);
  }
}
