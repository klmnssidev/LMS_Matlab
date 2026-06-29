import { z } from "zod";

export const TeacherSchema = z.object({
  teacherId: z.number(),
  departmentId: z.number(),
  teacherName: z.string().max(120),
  email: z.string().max(120).email(),
  phone: z.string().max(30).nullable(),
  academicRank: z.string().max(50),
  hireDate: z.string(),
  clerkUserId: z.string().nullable().optional(),
  employeeNumber: z.string().nullable().optional(),
});

export const CreateTeacherSchema = z.object({
  departmentId: z.number(),
  teacherName: z.string().min(1, "Name is required").max(120),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().max(30).nullable().optional(),
  academicRank: z.string().min(1, "Rank is required").max(50),
  hireDate: z.string().min(1, "Hire date is required"),
  employeeNumber: z.string().max(30).nullable().optional(),
});

export const UpdateTeacherSchema = CreateTeacherSchema.partial();

export const TeacherWithDeptSchema = TeacherSchema.extend({
  departmentName: z.string(),
  departmentCode: z.string(),
});

export type Teacher = z.infer<typeof TeacherSchema>;
export type CreateTeacher = z.infer<typeof CreateTeacherSchema>;
export type UpdateTeacher = z.infer<typeof UpdateTeacherSchema>;
export type TeacherWithDept = z.infer<typeof TeacherWithDeptSchema>;
