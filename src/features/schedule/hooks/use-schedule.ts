"use client";

import { useQuery } from "@tanstack/react-query";

export type ScheduleEntry = {
  offeringId: number;
  courseCode: string;
  courseName: string;
  sectionName: string;
  teacherName: string;
  roomCode: string;
  dayOfWeek: number | null;
  startTime: string | null;
  endTime: string | null;
};

async function fetchSchedule(): Promise<ScheduleEntry[]> {
  const res = await fetch("/api/schedule");
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: "Failed to fetch schedule" }));
    throw new Error(json.error ?? "Failed to fetch schedule");
  }
  return res.json();
}

export function useSchedule() {
  return useQuery({
    queryKey: ["schedule"],
    queryFn: fetchSchedule,
  });
}
