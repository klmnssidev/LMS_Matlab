"use client";

import { useQuery } from "@tanstack/react-query";

export type MyProfileData = {
  studentId: number;
  studentName: string;
  email: string;
  studentNumber: string | null;
  phone: string | null;
  gender: string;
  dateOfBirth: string | null;
  admissionYear: number;
  status: string | null;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
};

async function fetchMyProfile(): Promise<MyProfileData> {
  const res = await fetch("/api/my-profile");
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: "Failed to fetch profile" }));
    throw new Error(json.error ?? "Failed to fetch profile");
  }
  return res.json();
}

export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: fetchMyProfile,
  });
}
