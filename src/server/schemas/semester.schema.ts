import { z } from "zod";
import { dateString } from "@/lib/zod-utils";

export const SemesterSchema = z.object({
  semesterId: z.number(),
  semesterName: z.string().max(50),
  academicYear: z.string().max(20),
  startDate: dateString(),
  endDate: dateString(),
});

export const CreateSemesterSchema = SemesterSchema.omit({ semesterId: true });

export type Semester = z.infer<typeof SemesterSchema>;
export type CreateSemester = z.infer<typeof CreateSemesterSchema>;
