import { z } from "zod";

export const MyProfileResponseSchema = z.object({
  studentId: z.number(),
  studentName: z.string(),
  email: z.string().email(),
  studentNumber: z.string().nullable(),
  phone: z.string().nullable(),
  gender: z.string(),
  dateOfBirth: z.string().nullable(),
  admissionYear: z.number(),
  status: z.string().nullable(),
  departmentId: z.number(),
  departmentName: z.string(),
  departmentCode: z.string(),
});

export type MyProfileResponse = z.infer<typeof MyProfileResponseSchema>;
