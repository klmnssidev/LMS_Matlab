"use client";

import { useQuery } from "@tanstack/react-query";
import type { EnrollmentJoined } from "@/features/enrollments/types";

async function fetchMyCourses(): Promise<EnrollmentJoined[]> {
  const res = await fetch("/api/enrollments?self=true");
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: "Failed to fetch enrollments" }));
    throw new Error(json.error ?? "Failed to fetch enrollments");
  }
  const json = await res.json();
  return json.data ?? json;
}

export function useMyCourses() {
  return useQuery({
    queryKey: ["my-courses"],
    queryFn: fetchMyCourses,
  });
}
