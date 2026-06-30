"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchAdminStats() {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

async function fetchMyStats(semesterId?: number | null) {
  const params = new URLSearchParams();
  if (semesterId) params.set("semesterId", String(semesterId));
  const qs = params.toString();
  const res = await fetch(`/api/my-stats${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

async function fetchMe() {
  const res = await fetch("/api/me");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
  });
}

export function useMyStats(semesterId?: number | null) {
  return useQuery({
    queryKey: ["my-stats", semesterId],
    queryFn: () => fetchMyStats(semesterId),
  });
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
  });
}
