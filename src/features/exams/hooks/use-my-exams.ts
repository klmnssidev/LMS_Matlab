"use client";

import { useQuery } from "@tanstack/react-query";
import type { ExamJoined } from "@/server/schemas/exam.schema";

async function fetchMyExams(): Promise<ExamJoined[]> {
  const res = await fetch("/api/exams?self=true");
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: "Failed to fetch exams" }));
    throw new Error(json.error ?? "Failed to fetch exams");
  }
  return res.json();
}

export function useMyExams() {
  return useQuery({
    queryKey: ["my-exams"],
    queryFn: fetchMyExams,
  });
}
