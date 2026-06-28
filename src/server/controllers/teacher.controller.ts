import { NextRequest, NextResponse } from "next/server";
import * as teacherService from "@/server/services/teacher.service";
import { CreateTeacherSchema, UpdateTeacherSchema } from "@/server/schemas/teacher.schema";
import { requireRole } from "@/server/permissions/student.ability";

export async function list(req: NextRequest) {
  try {
    await requireRole("Admin", "Teacher");
    const { searchParams } = new URL(req.url);
    const filters = {
      search: searchParams.get("search") || undefined,
      departmentId: searchParams.get("department_id") ? Number(searchParams.get("department_id")) : undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined,
    };
    const [teachers, total] = await Promise.all([
      teacherService.list(filters),
      teacherService.count(filters),
    ]);
    return NextResponse.json({ data: teachers, total });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function getById(req: NextRequest) {
  try {
    await requireRole("Admin", "Teacher");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const teacher = await teacherService.getById(Number(id));
    if (!teacher) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(teacher);
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
    const parsed = CreateTeacherSchema.parse(body);
    const teacher = await teacherService.create(parsed);
    return NextResponse.json(teacher, { status: 201 });
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
    await requireRole("Admin");
    const body = await req.json();
    const { teacher_id, ...data } = body;
    if (!teacher_id) return NextResponse.json({ error: "teacher_id required" }, { status: 400 });
    const parsed = UpdateTeacherSchema.parse(data);
    const teacher = await teacherService.update(teacher_id, parsed);
    if (!teacher) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(teacher);
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
    await teacherService.remove(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
