import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as enrollmentService from "@/server/services/enrollment.service";
import * as accountLinkingService from "@/server/services/account-linking.service";
import { CreateEnrollmentSchema, UpdateEnrollmentSchema } from "@/server/schemas/enrollment.schema";
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
      studentId,
      offeringId: searchParams.get("offering_id") ? Number(searchParams.get("offering_id")) : undefined,
      status: searchParams.get("status") || undefined,
    };
    const [enrollments, total] = await Promise.all([
      enrollmentService.list(filters),
      enrollmentService.count(filters),
    ]);
    return NextResponse.json({ data: enrollments, total });
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
    const enrollment = await enrollmentService.getById(Number(id));
    if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(enrollment);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function create(req: NextRequest) {
  try {
    await requireRole("Admin");
    const body = await req.json();
    const parsed = CreateEnrollmentSchema.parse(body);
    const enrollment = await enrollmentService.create(parsed);
    return NextResponse.json(enrollment, { status: 201 });
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
    const { enrollment_id, ...data } = body;
    if (!enrollment_id) return NextResponse.json({ error: "enrollment_id required" }, { status: 400 });
    const parsed = UpdateEnrollmentSchema.parse(data);
    const enrollment = await enrollmentService.update(enrollment_id, parsed);
    if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(enrollment);
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
    await enrollmentService.remove(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
