import { NextRequest, NextResponse } from "next/server";
import { listStudents, getStudent, createStudent, updateStudent, deleteStudent } from "@/services/students";
import { requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const student = await getStudent(Number(id));
      if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(student);
    }
    const department_id = searchParams.get("department_id");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const students = await listStudents({
      department_id: department_id ? Number(department_id) : undefined,
      status: status || undefined,
      search: search || undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("Admin");
    const body = await req.json();
    const student = await createStudent(body);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole("Admin");
    const body = await req.json();
    const { student_id, ...data } = body;
    if (!student_id) return NextResponse.json({ error: "student_id required" }, { status: 400 });
    const student = await updateStudent(student_id, data);
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(student);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole("Admin");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const ok = await deleteStudent(Number(id));
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
