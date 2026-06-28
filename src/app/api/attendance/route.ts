import { NextRequest, NextResponse } from "next/server";
import { listAttendance, getAttendance, createAttendance, updateAttendance, deleteAttendance } from "@/services/attendance";
import { ForbiddenError, requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const record = await getAttendance(Number(id));
      if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(record);
    }
    const records = await listAttendance({
      enrollment_id: searchParams.get("enrollment_id") ? Number(searchParams.get("enrollment_id")) : undefined,
      offering_id: searchParams.get("offering_id") ? Number(searchParams.get("offering_id")) : undefined,
      student_id: searchParams.get("student_id") ? Number(searchParams.get("student_id")) : undefined,
      start_date: searchParams.get("start_date") || undefined,
      end_date: searchParams.get("end_date") || undefined,
    });
    return NextResponse.json(records);
  } catch (error) {
    const status = error instanceof ForbiddenError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("Admin", "Teacher");
    const body = await req.json();
    const record = await createAttendance(body);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    const status = error instanceof ForbiddenError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole("Admin", "Teacher");
    const body = await req.json();
    const { attendance_id, ...data } = body;
    if (!attendance_id) return NextResponse.json({ error: "attendance_id required" }, { status: 400 });
    const record = await updateAttendance(attendance_id, data);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(record);
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
    const ok = await deleteAttendance(Number(id));
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof ForbiddenError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status });
  }
}
