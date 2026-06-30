import { z } from "zod";

export const ScheduleEntrySchema = z.object({
  offeringId: z.number(),
  courseCode: z.string(),
  courseName: z.string(),
  sectionName: z.string(),
  teacherName: z.string(),
  roomCode: z.string(),
  dayOfWeek: z.number().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
});

export type ScheduleEntry = z.infer<typeof ScheduleEntrySchema>;

export const ScheduleResponseSchema = z.array(ScheduleEntrySchema);

export type ScheduleResponse = z.infer<typeof ScheduleResponseSchema>;
