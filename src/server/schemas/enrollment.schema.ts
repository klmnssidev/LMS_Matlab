import { z } from "zod";

export const EnrollmentSchema = z.object({
  enrollmentId: z.number(),
  studentId: z.number(),
  offeringId: z.number(),
  enrollmentDate: z.string(),
  status: z.enum(["Active", "Completed", "Dropped"]).default("Active"),
  finalGrade: z.string().max(5).nullable(),
});

export const CreateEnrollmentSchema = z.object({
  studentId: z.number(),
  offeringId: z.number(),
  enrollmentDate: z.string().min(1, "Date is required"),
  status: z.enum(["Active", "Completed", "Dropped"]).default("Active"),
  finalGrade: z.string().max(5).nullable().optional(),
});

export const UpdateEnrollmentSchema = CreateEnrollmentSchema.partial();

export const EnrollmentJoinedSchema = EnrollmentSchema.extend({
  studentName: z.string(),
  courseName: z.string(),
  courseCode: z.string(),
  sectionName: z.string(),
  semesterName: z.string(),
});

export type Enrollment = z.infer<typeof EnrollmentSchema>;
export type CreateEnrollment = z.infer<typeof CreateEnrollmentSchema>;
export type UpdateEnrollment = z.infer<typeof UpdateEnrollmentSchema>;
export type EnrollmentJoined = z.infer<typeof EnrollmentJoinedSchema>;
