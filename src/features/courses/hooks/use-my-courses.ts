"use client";

import { useQuery } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import type { EnrollmentJoined } from "@/features/enrollments/types";

async function fetchMyCourses(studentId: number): Promise<EnrollmentJoined[]> {
  const res = await fetch(`/api/enrollments?student_id=${studentId}`);
  if (!res.ok) throw new Error("Failed to fetch enrollments");
  const json = await res.json();
  return json.data ?? json;
}

export function useMyCourses() {
  const { user } = useUser();
  const dbId = (user?.publicMetadata?.db_id ?? 0) as number;

  return useQuery({
    queryKey: ["my-courses", dbId],
    queryFn: () => fetchMyCourses(dbId),
    enabled: dbId > 0,
  });
}
