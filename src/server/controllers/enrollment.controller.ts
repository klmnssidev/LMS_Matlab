import { NextRequest, NextResponse } from "next/server";
import * as enrollmentService from "@/server/services/enrollment.service";
import { CreateEnrollmentSchema, UpdateEnrollmentSchema } from "@/server/schemas/enrollment.schema";
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
    authz.authorize("read", isSelf ? "MyEnrollments" : "Enrollment");

    const filters = {
      studentId: searchParams.get("student_id") ? Number(searchParams.get("student_id")) : undefined,
      offeringId: searchParams.get("offering_id") ? Number(searchParams.get("offering_id")) : undefined,
      status: searchParams.get("status") || undefined,
    };
    const [enrollments, total] = await Promise.all([
      enrollmentService.list(filters, authz.scope),
      enrollmentService.count(filters, authz.scope),
    ]);
    return NextResponse.json({ data: enrollments, total });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getById(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "Enrollment");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const enrollment = await enrollmentService.getById(Number(id), authz.scope);
    if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(enrollment);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function create(req: NextRequest) {
  try {
    await authorize("create", "Enrollment");
    const body = await req.json();
    const parsed = CreateEnrollmentSchema.parse(body);
    const enrollment = await enrollmentService.create(parsed);
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) return zodErrorResponse(error);
    return errorResponse(error);
  }
}

export async function update(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("update", "Enrollment");
    const body = await req.json();
    const { enrollment_id, ...data } = body;
    if (!enrollment_id) return NextResponse.json({ error: "enrollment_id required" }, { status: 400 });

    const enrollment = await enrollmentService.update(enrollment_id, data, authz.scope);
    if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(enrollment);
  } catch (error) {
    if (error instanceof Error && "issues" in error) return zodErrorResponse(error);
    return errorResponse(error);
  }
}

export async function remove(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("delete", "Enrollment");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const result = await enrollmentService.remove(Number(id), authz.scope);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
