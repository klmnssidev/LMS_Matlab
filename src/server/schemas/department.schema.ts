import { z } from "zod";
import { dateStringNullable } from "@/lib/zod-utils";

export const DepartmentSchema = z.object({
  departmentId: z.number(),
  departmentCode: z.string().max(10),
  departmentName: z.string().max(100),
  facultyName: z.string().max(100),
  createdAt: dateStringNullable(),
});

export const CreateDepartmentSchema = DepartmentSchema.omit({ departmentId: true, createdAt: true });

export type Department = z.infer<typeof DepartmentSchema>;
export type CreateDepartment = z.infer<typeof CreateDepartmentSchema>;
