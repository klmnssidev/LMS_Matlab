import * as examRepo from "@/server/repositories/exam.repository";
import type { ExamFilters } from "@/server/repositories/exam.repository";
import type { AuthorizationScope } from "@/permissions";

export async function list(filters: ExamFilters = {}, scope?: AuthorizationScope) {
  return examRepo.findMany(filters, scope);
}

export async function getById(id: number, scope?: AuthorizationScope) {
  return examRepo.findById(id, scope);
}
