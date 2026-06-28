"use client";

import { useQuery } from "@tanstack/react-query";

type Semester = {
  semesterId: number;
  semesterName: string;
  academicYear: string;
};

async function fetchSemesters(): Promise<Semester[]> {
  const res = await fetch("/api/semesters");
  if (!res.ok) throw new Error("Failed to fetch semesters");
  return res.json();
}

export function useSemesters() {
  return useQuery({
    queryKey: ["semesters"],
    queryFn: fetchSemesters,
    staleTime: 5 * 60 * 1000,
  });
}
