"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type NotificationEntry = {
  notificationId: number;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

async function fetchNotifications(): Promise<NotificationEntry[]> {
  const res = await fetch("/api/notifications");
  if (!res.ok) {
    const json = await res.json().catch(() => ({ error: "Failed to fetch notifications" }));
    throw new Error(json.error ?? "Failed to fetch notifications");
  }
  return res.json();
}

async function fetchUnreadCount(): Promise<number> {
  const res = await fetch("/api/notifications?unread=true");
  if (!res.ok) return 0;
  const json = await res.json();
  return json.count ?? 0;
}

async function markRead(id: number): Promise<void> {
  const res = await fetch(`/api/notifications?id=${id}`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to mark as read");
}

async function markAllRead(): Promise<void> {
  const res = await fetch("/api/notifications?all=true", { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to mark all as read");
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
