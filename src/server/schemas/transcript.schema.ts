import { z } from "zod";

export const TranscriptQuerySchema = z.object({
  semesterId: z.coerce.number().optional(),
  academicYear: z.string().optional(),
});

export type TranscriptQuery = z.infer<typeof TranscriptQuerySchema>;

export const TranscriptEnrollmentSchema = z.object({
  enrollmentId: z.number(),
  semesterName: z.string(),
  academicYear: z.string(),
  courseCode: z.string(),
  courseName: z.string(),
  creditHours: z.number(),
  finalGrade: z.string().nullable(),
  letterGrade: z.string().nullable(),
  gradePoints: z.number().nullable(),
  examResults: z.array(z.object({
    examType: z.string(),
    score: z.number(),
    maxScore: z.number(),
  })),
});

export type TranscriptEnrollment = z.infer<typeof TranscriptEnrollmentSchema>;

export const SemesterGpaSchema = z.object({
  semesterId: z.number(),
  semesterName: z.string(),
  academicYear: z.string(),
  gpa: z.number().nullable(),
  totalCredits: z.number(),
  earnedCredits: z.number(),
  enrollments: z.array(TranscriptEnrollmentSchema),
});

export type SemesterGpa = z.infer<typeof SemesterGpaSchema>;

export const TranscriptResponseSchema = z.object({
  studentName: z.string(),
  departmentName: z.string(),
  studentNumber: z.string().nullable(),
  semesters: z.array(SemesterGpaSchema),
  cumulativeGpa: z.number().nullable(),
  totalCompletedCredits: z.number(),
});

export type TranscriptResponse = z.infer<typeof TranscriptResponseSchema>;
