"use client";

import { useQuery } from "@tanstack/react-query";
import type { AttendanceJoined } from "@/server/schemas/attendance.schema";

async function fetchMyAttendance(): Promise<AttendanceJoined[]> {
  const res = await fetch("/api/attendance?self=true");
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: "Failed to fetch attendance" }));
    throw new Error(json.error ?? "Failed to fetch attendance");
  }
  const json = await res.json();
  return json.data ?? json;
}

export function useMyAttendance() {
  return useQuery({
    queryKey: ["my-attendance"],
    queryFn: fetchMyAttendance,
  });
}
