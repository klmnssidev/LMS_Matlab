import * as announcementRepo from "@/server/repositories/announcement.repository";
import type { AuthorizationScope } from "@/permissions";

export type AnnouncementEntry = {
  announcementId: number;
  title: string;
  content: string;
  departmentName: string | null;
  createdAt: string;
};

function toEntry(row: Awaited<ReturnType<typeof announcementRepo.findMany>>[number]): AnnouncementEntry {
  return {
    announcementId: row.announcementId,
    title: row.title,
    content: row.content,
    departmentName: row.department?.departmentName ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function list(scope: AuthorizationScope): Promise<AnnouncementEntry[]> {
  const rows = await announcementRepo.findMany(scope);
  return rows.map(toEntry);
}
