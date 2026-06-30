import * as examResultRepo from "@/server/repositories/exam-result.repository";
import type { ExamResultFilters } from "@/server/repositories/exam-result.repository";
import type { CreateExamResult, UpdateExamResult, ExamResultJoined } from "@/server/schemas/exam-result.schema";
import type { AuthorizationScope } from "@/permissions";

function toExamResultJoined(row: Awaited<ReturnType<typeof examResultRepo.findMany>>[number]): ExamResultJoined {
  return {
    resultId: row.resultId,
    examId: row.examId,
    enrollmentId: row.enrollmentId,
    score: Number(row.score),
    studentName: row.enrollment.student.studentName,
    examType: row.exam.examType,
    maxScore: Number(row.exam.maxScore),
    courseName: row.enrollment.offering.course.courseName,
  };
}

export async function list(filters: ExamResultFilters, scope?: AuthorizationScope) {
  const rows = await examResultRepo.findMany(filters, scope);
  return rows.map(toExamResultJoined);
}

export async function getById(id: number, scope?: AuthorizationScope) {
  const row = await examResultRepo.findById(id, scope);
  if (!row) return null;
  return toExamResultJoined(row);
}

export async function create(data: CreateExamResult) {
  const row = await examResultRepo.create({
    score: data.score,
    exam: { connect: { examId: data.examId } },
    enrollment: { connect: { enrollmentId: data.enrollmentId } },
  });
  return row;
}

export async function update(id: number, data: UpdateExamResult, scope?: AuthorizationScope) {
  const existing = await examResultRepo.findById(id, scope);
  if (!existing) return null;

  const updateData: Record<string, unknown> = {};
  if (data.score !== undefined) updateData.score = data.score;
  if (data.examId !== undefined) updateData.exam = { connect: { examId: data.examId } };
  if (data.enrollmentId !== undefined) updateData.enrollment = { connect: { enrollmentId: data.enrollmentId } };

  const row = await examResultRepo.update(id, updateData);
  return row;
}

export async function remove(id: number, scope?: AuthorizationScope) {
  const existing = await examResultRepo.findById(id, scope);
  if (!existing) return null;
  return examResultRepo.remove(id);
}

export async function count(filters: ExamResultFilters, scope?: AuthorizationScope) {
  return examResultRepo.count(filters, scope);
}
