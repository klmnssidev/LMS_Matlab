import type { AttendanceJoined } from "@/server/schemas/attendance.schema";

const BASE = "/api/attendance";

export type AttendanceListParams = {
  enrollment_id?: number;
  offering_id?: number;
  student_id?: number;
  start_date?: string;
  end_date?: string;
};

export type AttendanceListResponse = {
  data: AttendanceJoined[];
  total: number;
};

export async function fetchAttendance(params: AttendanceListParams = {}): Promise<AttendanceListResponse> {
  const url = new URL(BASE, window.location.origin);
  if (params.enrollment_id) url.searchParams.set("enrollment_id", String(params.enrollment_id));
  if (params.offering_id) url.searchParams.set("offering_id", String(params.offering_id));
  if (params.student_id) url.searchParams.set("student_id", String(params.student_id));
  if (params.start_date) url.searchParams.set("start_date", params.start_date);
  if (params.end_date) url.searchParams.set("end_date", params.end_date);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to fetch attendance" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function createAttendance(data: Record<string, unknown>): Promise<AttendanceJoined> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to create attendance" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function updateAttendance(data: Record<string, unknown>): Promise<AttendanceJoined> {
  const res = await fetch(BASE, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to update attendance" }));
    throw new Error(err.error);
  }
  return res.json();
}

export async function deleteAttendance(id: number): Promise<void> {
  const res = await fetch(`${BASE}?id=${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Failed to delete attendance" }));
    throw new Error(err.error);
  }
}
