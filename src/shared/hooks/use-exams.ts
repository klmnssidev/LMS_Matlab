"use client";

import { useQuery } from "@tanstack/react-query";

type Exam = {
  examId: number;
  examType: string;
  examDate: string;
  offeringId: number;
  offering: { course: { courseCode: string; courseName: string } };
};

async function fetchExams(): Promise<Exam[]> {
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
