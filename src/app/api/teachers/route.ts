import { NextRequest, NextResponse } from "next/server";
import { listTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher } from "@/services/teachers";
import { ForbiddenError, requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const teacher = await getTeacher(Number(id));
      if (!teacher) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(teacher);
    }
    const department_id = searchParams.get("department_id");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const teachers = await listTeachers({
      department_id: department_id ? Number(department_id) : undefined,
      search: search || undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
    return NextResponse.json(teachers);
  } catch (error) {
    const status = error instanceof ForbiddenError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("Admin");
    const body = await req.json();
    const teacher = await createTeacher(body);
    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    const status = error instanceof ForbiddenError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole("Admin");
    const body = await req.json();
    const { teacher_id, ...data } = body;
    if (!teacher_id) return NextResponse.json({ error: "teacher_id required" }, { status: 400 });
    const teacher = await updateTeacher(teacher_id, data);
    if (!teacher) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(teacher);
  } catch (error) {
    const status = error instanceof ForbiddenError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole("Admin");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const ok = await deleteTeacher(Number(id));
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof ForbiddenError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status });
  }
}
