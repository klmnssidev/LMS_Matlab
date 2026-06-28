"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchAdminStats() {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

async function fetchMyStats() {
  const res = await fetch("/api/my-stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: fetchAdminStats,
  });
}

export function useMyStats() {
  return useQuery({
    queryKey: ["my-stats"],
    queryFn: fetchMyStats,
  });
}
