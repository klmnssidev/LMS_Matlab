"use client";

import { useQuery } from "@tanstack/react-query";

export type MyExam = {
  examId: number;
  examType: string;
  examDate: string;
  maxScore: number;
  offeringId: number;
  offering: {
    course: {
      courseId: number;
      courseCode: string;
      courseName: string;
    };
  };
};

async function fetchMyExams(): Promise<MyExam[]> {
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
