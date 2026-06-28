import { z } from "zod";

export const ExamResultSchema = z.object({
  resultId: z.number(),
  examId: z.number(),
  enrollmentId: z.number(),
  score: z.number(),
});

export const CreateExamResultSchema = z.object({
  examId: z.number(),
  enrollmentId: z.number(),
  score: z.number(),
});

export const UpdateExamResultSchema = CreateExamResultSchema.partial();

export const ExamResultJoinedSchema = ExamResultSchema.extend({
  studentName: z.string(),
  examType: z.string(),
  maxScore: z.number(),
});

export type ExamResult = z.infer<typeof ExamResultSchema>;
export type CreateExamResult = z.infer<typeof CreateExamResultSchema>;
export type UpdateExamResult = z.infer<typeof UpdateExamResultSchema>;
export type ExamResultJoined = z.infer<typeof ExamResultJoinedSchema>;
