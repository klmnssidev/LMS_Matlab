import type { StudentWithDept } from "@/server/schemas/student.schema";

const BASE = "/api/students";

export type StudentListParams = {
  search?: string;
  status?: string;
  department_id?: number;
  limit?: number;
  offset?: number;
};

export type StudentListResponse = {
  data: StudentWithDept[];
  total: number;
};

export async function fetchStudents(params: StudentListParams = {}): Promise<StudentListResponse> {
  const url = new URL(BASE, window.location.origin);
  if (params.search) url.searchParams.set("search", params.search);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.department_id) url.searchParams.set("department_id", String(params.department_id));
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.offset) url.searchParams.set("offset", String(params.offset));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch students" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function fetchStudent(id: number): Promise<StudentWithDept> {
  const res = await fetch(`${BASE}?id=${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch student" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function createStudent(data: Record<string, unknown>): Promise<StudentWithDept> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create student" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function updateStudent(data: Record<string, unknown>): Promise<StudentWithDept> {
  const res = await fetch(BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to update student" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function deleteStudent(id: number): Promise<void> {
  const res = await fetch(`${BASE}?id=${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to delete student" }));
    throw new Error(err.error);
  }
}
