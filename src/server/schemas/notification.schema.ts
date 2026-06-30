import { z } from "zod";

export const NotificationQuerySchema = z.object({
  unread: z.coerce.boolean().optional(),
});

export type NotificationQuery = z.infer<typeof NotificationQuerySchema>;

export const NotificationEntrySchema = z.object({
  notificationId: z.number(),
  type: z.string(),
  title: z.string(),
  message: z.string().nullable(),
  link: z.string().nullable(),
  isRead: z.boolean(),
  createdAt: z.string(),
});

export type NotificationEntry = z.infer<typeof NotificationEntrySchema>;

export const NotificationsResponseSchema = z.array(NotificationEntrySchema);

export type NotificationsResponse = z.infer<typeof NotificationsResponseSchema>;

export const MarkReadQuerySchema = z.object({
  id: z.coerce.number().optional(),
  all: z.coerce.boolean().optional(),
});

export type MarkReadQuery = z.infer<typeof MarkReadQuerySchema>;
