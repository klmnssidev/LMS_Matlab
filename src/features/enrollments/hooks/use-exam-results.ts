"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchExamResults } from "@/features/enrollments/services";
import type { ExamResultJoined } from "@/features/enrollments/services";

export function useExamResults(params?: { student_id?: number; exam_id?: number; self?: boolean }) {
  return useQuery<ExamResultJoined[]>({
    queryKey: ["exam-results", params],
    queryFn: () => fetchExamResults(params),
    enabled: !!params?.student_id || !!params?.exam_id || !!params?.self,
  });
}
