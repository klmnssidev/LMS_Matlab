import { NextRequest, NextResponse } from "next/server";
import * as examResultService from "@/server/services/exam-result.service";
import { CreateExamResultSchema, UpdateExamResultSchema } from "@/server/schemas/exam-result.schema";
import { getAuthorizationContext, authorize } from "@/permissions";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status = message.includes("Forbidden") ? 403 : 500;
  return NextResponse.json({ error: message }, { status });
}

function zodErrorResponse(error: unknown) {
  return NextResponse.json(
    { error: "Validation failed", details: (error as { issues: unknown[] }).issues },
    { status: 400 },
  );
}

export async function list(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    const { searchParams } = new URL(req.url);

    const isSelf = searchParams.get("self") === "true";
    authz.authorize("read", isSelf ? "MyGrades" : "ExamResult");

    const filters = {
      examId: searchParams.get("exam_id") ? Number(searchParams.get("exam_id")) : undefined,
      enrollmentId: searchParams.get("enrollment_id") ? Number(searchParams.get("enrollment_id")) : undefined,
      studentId: searchParams.get("student_id") ? Number(searchParams.get("student_id")) : undefined,
    };
    const [results, total] = await Promise.all([
      examResultService.list(filters, authz.scope),
      examResultService.count(filters, authz.scope),
    ]);
    return NextResponse.json({ data: results, total });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getById(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "ExamResult");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const result = await examResultService.getById(Number(id), authz.scope);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function create(req: NextRequest) {
  try {
    await authorize("create", "ExamResult");
    const body = await req.json();
    const parsed = CreateExamResultSchema.parse(body);
    const result = await examResultService.create(parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) return zodErrorResponse(error);
    return errorResponse(error);
  }
}

export async function update(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("update", "ExamResult");
    const body = await req.json();
    const { result_id, ...data } = body;
    if (!result_id) return NextResponse.json({ error: "result_id required" }, { status: 400 });

    const result = await examResultService.update(result_id, data, authz.scope);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && "issues" in error) return zodErrorResponse(error);
    return errorResponse(error);
  }
}

export async function remove(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("delete", "ExamResult");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const result = await examResultService.remove(Number(id), authz.scope);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
