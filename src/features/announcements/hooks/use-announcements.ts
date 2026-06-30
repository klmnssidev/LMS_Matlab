"use client";

import { useQuery } from "@tanstack/react-query";

export type AnnouncementEntry = {
  announcementId: number;
  title: string;
  content: string;
  departmentName: string | null;
  createdAt: string;
};

async function fetchAnnouncements(): Promise<AnnouncementEntry[]> {
  const res = await fetch("/api/announcements");
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: "Failed to fetch announcements" }));
    throw new Error(json.error ?? "Failed to fetch announcements");
  }
  return res.json();
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });
}
