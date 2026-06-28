import { NextRequest, NextResponse } from "next/server";
import { listExamResults, getExamResult } from "@/services/exam-results";
import { ForbiddenError, requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    await requireRole("Admin", "Teacher", "Student");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const record = await getExamResult(Number(id));
      if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(record);
    }
    const records = await listExamResults({
      exam_id: searchParams.get("exam_id") ? Number(searchParams.get("exam_id")) : undefined,
      enrollment_id: searchParams.get("enrollment_id") ? Number(searchParams.get("enrollment_id")) : undefined,
      student_id: searchParams.get("student_id") ? Number(searchParams.get("student_id")) : undefined,
    });
    return NextResponse.json(records);
  } catch (error) {
    const status = error instanceof ForbiddenError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status });
  }
}
