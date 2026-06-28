import { z } from "zod";

export const AttendanceSchema = z.object({
  attendanceId: z.number(),
  enrollmentId: z.number(),
  attendanceDate: z.string(),
  status: z.enum(["Present", "Absent", "Late", "Excused"]),
  remarks: z.string().max(255).nullable(),
});

export const CreateAttendanceSchema = z.object({
  enrollmentId: z.number(),
  attendanceDate: z.string().min(1, "Date is required"),
  status: z.enum(["Present", "Absent", "Late", "Excused"]),
  remarks: z.string().max(255).nullable().optional(),
});

export const UpdateAttendanceSchema = CreateAttendanceSchema.partial();

export const AttendanceJoinedSchema = AttendanceSchema.extend({
  studentName: z.string(),
  courseName: z.string(),
});

export type Attendance = z.infer<typeof AttendanceSchema>;
export type CreateAttendance = z.infer<typeof CreateAttendanceSchema>;
export type UpdateAttendance = z.infer<typeof UpdateAttendanceSchema>;
export type AttendanceJoined = z.infer<typeof AttendanceJoinedSchema>;
