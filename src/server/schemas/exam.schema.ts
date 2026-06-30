import { z } from "zod";
import { dateString } from "@/lib/zod-utils";

export const ExamSchema = z.object({
  examId: z.number(),
  offeringId: z.number(),
  examType: z.string().max(10),
  examDate: dateString(),
  maxScore: z.number(),
});

export const CreateExamSchema = ExamSchema.omit({ examId: true });

export const ExamJoinedSchema = ExamSchema.extend({
  courseName: z.string(),
  courseCode: z.string(),
});

export const ExamQuerySchema = z.object({
  self: z.coerce.boolean().optional(),
  offeringId: z.coerce.number().optional(),
});

export type ExamQuery = z.infer<typeof ExamQuerySchema>;

export type Exam = z.infer<typeof ExamSchema>;
export type CreateExam = z.infer<typeof CreateExamSchema>;
export type ExamJoined = z.infer<typeof ExamJoinedSchema>;
