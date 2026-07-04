import * as examRepo from "@/server/repositories/exam.repository";
import type { ExamFilters } from "@/server/repositories/exam.repository";
import type { CreateExam, UpdateExam, ExamJoined } from "@/server/schemas/exam.schema";
import type { AuthorizationScope } from "@/permissions";

function toExamJoined(row: Awaited<ReturnType<typeof examRepo.findMany>>[number]): ExamJoined {
  return {
    examId: row.examId,
    offeringId: row.offeringId,
    examType: row.examType,
    examDate: row.examDate instanceof Date ? row.examDate.toISOString().split("T")[0] : row.examDate,
    maxScore: Number(row.maxScore),
    offering: {
      course: {
        courseId: row.offering.course.courseId,
        courseCode: row.offering.course.courseCode,
        courseName: row.offering.course.courseName,
      },
    },
  };
}

export async function list(filters: ExamFilters = {}, scope?: AuthorizationScope) {
  const rows = await examRepo.findMany(filters, scope);
  return rows.map(toExamJoined);
}

export async function getById(id: number, scope?: AuthorizationScope) {
  const row = await examRepo.findById(id, scope);
  if (!row) return null;
  return toExamJoined(row);
}

export async function create(data: CreateExam) {
  const row = await examRepo.create({
    offering: { connect: { offeringId: data.offeringId } },
    examType: data.examType,
    examDate: new Date(data.examDate),
    maxScore: data.maxScore,
  });
  return toExamJoined(row);
}

export async function update(id: number, data: UpdateExam, scope?: AuthorizationScope) {
  const existing = await examRepo.findById(id, scope);
  if (!existing) return null;

  const updateData: Record<string, unknown> = {};
  if (data.offeringId !== undefined) updateData.offering = { connect: { offeringId: data.offeringId } };
  if (data.examType !== undefined) updateData.examType = data.examType;
  if (data.examDate !== undefined) updateData.examDate = new Date(data.examDate);
  if (data.maxScore !== undefined) updateData.maxScore = data.maxScore;

  const row = await examRepo.update(id, updateData);
  if (!row) return null;
  return toExamJoined(row);
}

export async function remove(id: number, scope?: AuthorizationScope) {
  const existing = await examRepo.findById(id, scope);
  if (!existing) return null;
  return examRepo.remove(id);
}

export async function count(filters: ExamFilters = {}, scope?: AuthorizationScope) {
  return examRepo.count(filters, scope);
}
