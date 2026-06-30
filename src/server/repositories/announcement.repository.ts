import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";

export async function findMany(scope?: AuthorizationScope) {
  const where: Prisma.AnnouncementWhereInput = {};

  if (scope?.role === "Student") {
    where.OR = [
      { departmentId: scope.departmentId },
      { departmentId: null },
    ];
  }

  return prisma.announcement.findMany({
    where,
    include: { department: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function findById(id: number) {
  return prisma.announcement.findUnique({
    where: { announcementId: id },
    include: { department: true },
  });
}

export async function create(data: Prisma.AnnouncementCreateInput) {
  return prisma.announcement.create({ data });
}
