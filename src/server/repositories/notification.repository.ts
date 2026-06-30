import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

function applyScope(scope?: AuthorizationScope): Prisma.NotificationWhereInput {
  if (scope?.role) {
    return { userAccountId: scope.accountId };
  }
  return {};
}

export async function findMany(scope?: AuthorizationScope) {
  return prisma.notification.findMany({
    where: { ...applyScope(scope) },
    orderBy: { createdAt: "desc" },
  });
}

export async function countUnread(scope?: AuthorizationScope) {
  return prisma.notification.count({
    where: { ...applyScope(scope), isRead: false },
  });
}

export async function markAsRead(id: number) {
  return prisma.notification.update({
    where: { notificationId: id },
    data: { isRead: true },
  });
}

export async function markAllAsRead(accountId: number) {
  return prisma.notification.updateMany({
    where: { userAccountId: accountId, isRead: false },
    data: { isRead: true },
  });
}

export async function create(data: Prisma.NotificationCreateInput) {
  return prisma.notification.create({ data });
}
