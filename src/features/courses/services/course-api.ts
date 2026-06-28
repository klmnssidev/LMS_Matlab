import type { CourseWithDept } from "@/server/schemas/course.schema";

const BASE = "/api/courses";

export type CourseListParams = {
  search?: string;
  limit?: number;
  offset?: number;
};

export type CourseWithOfferings = CourseWithDept & {
  offerings: {
    offeringId: number;
    sectionName: string;
    teacherName: string;
    semesterName: string;
    roomCode: string;
  }[];
};

export type CourseListResponse = {
  data: CourseWithDept[];
  total: number;
};

export async function fetchCourses(params: CourseListParams = {}): Promise<CourseListResponse> {
  const url = new URL(BASE, window.location.origin);
  if (params.search) url.searchParams.set("search", params.search);
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.offset) url.searchParams.set("offset", String(params.offset));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch courses" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function fetchCourse(id: number): Promise<CourseWithOfferings> {
  const res = await fetch(`${BASE}?id=${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch course" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function createCourse(data: Record<string, unknown>): Promise<CourseWithDept> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create course" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function updateCourse(data: Record<string, unknown>): Promise<CourseWithDept> {
  const res = await fetch(BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to update course" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function deleteCourse(id: number): Promise<void> {
  const res = await fetch(`${BASE}?id=${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to delete course" }));
    throw new Error(err.error);
  }
}
