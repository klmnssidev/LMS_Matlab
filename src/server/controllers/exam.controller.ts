import { NextRequest, NextResponse } from "next/server";
import * as examService from "@/server/services/exam.service";
import { CreateExamSchema, UpdateExamSchema } from "@/server/schemas/exam.schema";
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
    authz.authorize("read", isSelf ? "MyExams" : "Exam");

    const filters = {
      offeringId: searchParams.get("offering_id") ? Number(searchParams.get("offering_id")) : undefined,
    };
    const exams = await examService.list(filters, authz.scope);
    return NextResponse.json(exams);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getById(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "Exam");
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("id");
    if (!raw) return NextResponse.json({ error: "id required" }, { status: 400 });
    const id = Number(raw);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const exam = await examService.getById(id, authz.scope);
    if (!exam) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(exam);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function create(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("create", "Exam");
    const body = await req.json();
    const parsed = CreateExamSchema.parse(body);
    const exam = await examService.create(parsed, authz.scope);
    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) return zodErrorResponse(error);
    return errorResponse(error);
  }
}

export async function update(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("update", "Exam");
    const body = await req.json();
    const { exam_id, ...data } = body;
    if (!exam_id) return NextResponse.json({ error: "exam_id required" }, { status: 400 });
    const id = Number(exam_id);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid exam_id" }, { status: 400 });
    const parsed = UpdateExamSchema.parse(data);
    const exam = await examService.update(id, parsed, authz.scope);
    if (!exam) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(exam);
  } catch (error) {
    if (error instanceof Error && "issues" in error) return zodErrorResponse(error);
    return errorResponse(error);
  }
}

export async function remove(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("delete", "Exam");
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("id");
    if (!raw) return NextResponse.json({ error: "id required" }, { status: 400 });
    const id = Number(raw);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const result = await examService.remove(id, authz.scope);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
