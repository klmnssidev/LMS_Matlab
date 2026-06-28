export type { ExamResult, ExamResultJoined } from "@/server/schemas/exam-result.schema";

// exam-results API
export async function fetchExamResults(params?: { student_id?: number; exam_id?: number }) {
  const search = new URLSearchParams();
  if (params?.student_id) search.set("student_id", String(params.student_id));
  if (params?.exam_id) search.set("exam_id", String(params.exam_id));
  const url = `/api/exam-results${search.toString() ? `?${search.toString()}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch exam results");
  const json = await res.json();
  return json.data ?? json;
}
