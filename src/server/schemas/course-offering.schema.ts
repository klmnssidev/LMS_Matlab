import { z } from "zod";

export const CourseOfferingSchema = z.object({
  offeringId: z.number(),
  courseId: z.number(),
  teacherId: z.number(),
  semesterId: z.number(),
  classroomId: z.number(),
  sectionName: z.string().max(10).default("A"),
  maxStudents: z.number().default(40),
});

export const CreateCourseOfferingSchema = CourseOfferingSchema.omit({ offeringId: true });

export const CourseOfferingJoinedSchema = CourseOfferingSchema.extend({
  courseCode: z.string(),
  courseName: z.string(),
  teacherName: z.string(),
  semesterName: z.string(),
  roomCode: z.string(),
});

export type CourseOffering = z.infer<typeof CourseOfferingSchema>;
export type CreateCourseOffering = z.infer<typeof CreateCourseOfferingSchema>;
export type CourseOfferingJoined = z.infer<typeof CourseOfferingJoinedSchema>;
