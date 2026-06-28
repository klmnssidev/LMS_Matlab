import type { TeacherWithDept } from "@/server/schemas/teacher.schema";

const BASE = "/api/teachers";

export type TeacherListParams = {
  search?: string;
  department_id?: number;
  limit?: number;
  offset?: number;
};

export type TeacherWithOfferings = TeacherWithDept & {
  courseOfferings: {
    offeringId: number;
    courseCode: string;
    courseName: string;
    semesterName: string;
    roomCode: string;
    sectionName: string;
  }[];
};

export type TeacherListResponse = {
  data: TeacherWithDept[];
  total: number;
};

export async function fetchTeachers(params: TeacherListParams = {}): Promise<TeacherListResponse> {
  const url = new URL(BASE, window.location.origin);
  if (params.search) url.searchParams.set("search", params.search);
  if (params.department_id) url.searchParams.set("department_id", String(params.department_id));
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.offset) url.searchParams.set("offset", String(params.offset));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch teachers" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function fetchTeacher(id: number): Promise<TeacherWithOfferings> {
  const res = await fetch(`${BASE}?id=${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch teacher" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function createTeacher(data: Record<string, unknown>): Promise<TeacherWithDept> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create teacher" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function updateTeacher(data: Record<string, unknown>): Promise<TeacherWithDept> {
  const res = await fetch(BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to update teacher" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function deleteTeacher(id: number): Promise<void> {
  const res = await fetch(`${BASE}?id=${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to delete teacher" }));
    throw new Error(err.error);
  }
}
