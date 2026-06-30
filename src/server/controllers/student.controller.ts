import { NextRequest, NextResponse } from "next/server";
import * as studentService from "@/server/services/student.service";
import { CreateStudentSchema, UpdateStudentSchema } from "@/server/schemas/student.schema";
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
    authz.authorize("read", "Student");
    const { searchParams } = new URL(req.url);
    const filters = {
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      departmentId: searchParams.get("department_id") ? Number(searchParams.get("department_id")) : undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined,
    };
    const [students, total] = await Promise.all([
      studentService.list(filters, authz.scope),
      studentService.count(filters, authz.scope),
    ]);
    return NextResponse.json({ data: students, total });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getById(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "Student");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const student = await studentService.getById(Number(id), authz.scope);
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(student);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function create(req: NextRequest) {
  try {
    await authorize("create", "Student");
    const body = await req.json();
    const parsed = CreateStudentSchema.parse(body);
    const student = await studentService.create(parsed);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) return zodErrorResponse(error);
    return errorResponse(error);
  }
}

export async function update(req: NextRequest) {
  try {
    await authorize("update", "Student");
    const body = await req.json();
    const { student_id, ...data } = body;
    if (!student_id) return NextResponse.json({ error: "student_id required" }, { status: 400 });
    const parsed = UpdateStudentSchema.parse(data);
    const student = await studentService.update(student_id, parsed);
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(student);
  } catch (error) {
    if (error instanceof Error && "issues" in error) return zodErrorResponse(error);
    return errorResponse(error);
  }
}

export async function remove(req: NextRequest) {
  try {
    await authorize("delete", "Student");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await studentService.remove(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
