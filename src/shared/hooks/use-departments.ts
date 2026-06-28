"use client";

import { useQuery } from "@tanstack/react-query";

type Department = {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
};

async function fetchDepartments(): Promise<Department[]> {
  const res = await fetch("/api/departments");
  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
}

export function useDepartments() {
  return useQuery({
    queryKey: ["departments"],
    queryFn: fetchDepartments,
    staleTime: 5 * 60 * 1000,
  });
}
