import { z } from "zod";

export const AnnouncementEntrySchema = z.object({
  announcementId: z.number(),
  title: z.string(),
  content: z.string(),
  departmentName: z.string().nullable(),
  createdAt: z.string(),
});

export type AnnouncementEntry = z.infer<typeof AnnouncementEntrySchema>;

export const AnnouncementsResponseSchema = z.array(AnnouncementEntrySchema);

export type AnnouncementsResponse = z.infer<typeof AnnouncementsResponseSchema>;
