import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as examResultService from "@/server/services/exam-result.service";
import * as accountLinkingService from "@/server/services/account-linking.service";
import { CreateExamResultSchema, UpdateExamResultSchema } from "@/server/schemas/exam-result.schema";
import { requireRole } from "@/server/permissions/student.ability";

export async function list(req: NextRequest) {
  try {
    await requireRole("Admin", "Teacher", "Student");
    const { searchParams } = new URL(req.url);

    let studentId: number | undefined;
    if (searchParams.get("self") === "true") {
      const session = await auth();
      if (session.userId) {
        const linked = await accountLinkingService.getLinkedUser(session.userId);
        if (linked?.type === "student") {
          studentId = linked.record.studentId;
        }
      }
    } else {
      studentId = searchParams.get("student_id") ? Number(searchParams.get("student_id")) : undefined;
    }

    const filters = {
      examId: searchParams.get("exam_id") ? Number(searchParams.get("exam_id")) : undefined,
      enrollmentId: searchParams.get("enrollment_id") ? Number(searchParams.get("enrollment_id")) : undefined,
      studentId,
    };
    const [results, total] = await Promise.all([
      examResultService.list(filters),
      examResultService.count(filters),
    ]);
    return NextResponse.json({ data: results, total });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function getById(req: NextRequest) {
  try {
    await requireRole("Admin", "Teacher", "Student");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const result = await examResultService.getById(Number(id));
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function create(req: NextRequest) {
  try {
    await requireRole("Admin", "Teacher");
    const body = await req.json();
    const parsed = CreateExamResultSchema.parse(body);
    const result = await examResultService.create(parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: (error as { issues: unknown[] }).issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function update(req: NextRequest) {
  try {
    await requireRole("Admin", "Teacher");
    const body = await req.json();
    const { result_id, ...data } = body;
    if (!result_id) return NextResponse.json({ error: "result_id required" }, { status: 400 });
    const parsed = UpdateExamResultSchema.parse(data);
    const result = await examResultService.update(result_id, parsed);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json({ error: "Validation failed", details: (error as { issues: unknown[] }).issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function remove(req: NextRequest) {
  try {
    await requireRole("Admin");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await examResultService.remove(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
