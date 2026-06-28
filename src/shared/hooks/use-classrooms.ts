"use client";

import { useQuery } from "@tanstack/react-query";

type Classroom = {
  classroomId: number;
  roomCode: string;
  building: string;
  capacity: number;
};

async function fetchClassrooms(): Promise<Classroom[]> {
  const res = await fetch("/api/classrooms");
  if (!res.ok) throw new Error("Failed to fetch classrooms");
  return res.json();
}

export function useClassrooms() {
  return useQuery({
    queryKey: ["classrooms"],
    queryFn: fetchClassrooms,
    staleTime: 5 * 60 * 1000,
  });
}
