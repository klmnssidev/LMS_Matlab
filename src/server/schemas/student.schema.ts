import { z } from "zod";

export const StudentSchema = z.object({
  studentId: z.number(),
  departmentId: z.number(),
  studentName: z.string().max(120),
  email: z.string().max(120).email(),
  phone: z.string().max(30).nullable(),
  gender: z.enum(["Male", "Female"]),
  dateOfBirth: z.string().nullable(),
  admissionYear: z.number(),
  status: z.enum(["Active", "Graduated", "Suspended", "Withdrawn"]).default("Active"),
});

export const CreateStudentSchema = z.object({
  departmentId: z.number(),
  studentName: z.string().min(1, "Name is required").max(120),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().max(30).nullable().optional(),
  gender: z.enum(["Male", "Female"]),
  dateOfBirth: z.string().nullable().optional(),
  admissionYear: z.number(),
  status: z.enum(["Active", "Graduated", "Suspended", "Withdrawn"]).default("Active"),
});

export const UpdateStudentSchema = CreateStudentSchema.partial();

export const StudentWithDeptSchema = StudentSchema.extend({
  departmentName: z.string(),
  departmentCode: z.string(),
});

export type Student = z.infer<typeof StudentSchema>;
export type CreateStudent = z.infer<typeof CreateStudentSchema>;
export type UpdateStudent = z.infer<typeof UpdateStudentSchema>;
export type StudentWithDept = z.infer<typeof StudentWithDeptSchema>;
