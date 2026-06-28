import { z } from "zod";

export const CourseSchema = z.object({
  courseId: z.number(),
  departmentId: z.number(),
  courseCode: z.string().max(20),
  courseName: z.string().max(150),
  creditHours: z.number().min(1).max(6),
});

export const CreateCourseSchema = z.object({
  departmentId: z.number(),
  courseCode: z.string().min(1, "Code is required").max(20),
  courseName: z.string().min(1, "Name is required").max(150),
  creditHours: z.number().min(1, "Min 1 credit").max(6, "Max 6 credits"),
});

export const UpdateCourseSchema = CreateCourseSchema.partial();

export const CourseWithDeptSchema = CourseSchema.extend({
  departmentName: z.string(),
  departmentCode: z.string(),
});

export type Course = z.infer<typeof CourseSchema>;
export type CreateCourse = z.infer<typeof CreateCourseSchema>;
export type UpdateCourse = z.infer<typeof UpdateCourseSchema>;
export type CourseWithDept = z.infer<typeof CourseWithDeptSchema>;
