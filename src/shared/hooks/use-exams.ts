"use client";

import { useQuery } from "@tanstack/react-query";
import type { ExamJoined } from "@/server/schemas/exam.schema";

async function fetchExams(): Promise<ExamJoined[]> {
  const res = await fetch("/api/exams");
  if (!res.ok) throw new Error("Failed to fetch exams");
  return res.json();
}

export function useExams() {
  return useQuery({
    queryKey: ["exams"],
    queryFn: fetchExams,
    staleTime: 5 * 60 * 1000,
  });
}
