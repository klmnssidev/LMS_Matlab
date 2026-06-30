import * as notificationRepo from "@/server/repositories/notification.repository";
import type { AuthorizationScope } from "@/permissions";

export type NotificationEntry = {
  notificationId: number;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

function toEntry(row: Awaited<ReturnType<typeof notificationRepo.findMany>>[number]): NotificationEntry {
  return {
    notificationId: row.notificationId,
    type: row.type,
    title: row.title,
    message: row.message,
    link: row.link,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function list(scope: AuthorizationScope): Promise<NotificationEntry[]> {
  const rows = await notificationRepo.findMany(scope);
  return rows.map(toEntry);
}

export async function getUnreadCount(scope: AuthorizationScope): Promise<number> {
  return notificationRepo.countUnread(scope);
}

export async function markAsRead(id: number) {
  return notificationRepo.markAsRead(id);
}

export async function markAllAsRead(accountId: number) {
  return notificationRepo.markAllAsRead(accountId);
}

export async function create(data: { userAccountId: number; type: string; title: string; message?: string; link?: string }) {
  return notificationRepo.create({
    userAccount: { connect: { id: data.userAccountId } },
    type: data.type,
    title: data.title,
    message: data.message ?? null,
    link: data.link ?? null,
  });
}
