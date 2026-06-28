import { NextRequest, NextResponse } from "next/server";
import * as attendanceService from "@/server/services/attendance.service";
import { CreateAttendanceSchema, UpdateAttendanceSchema } from "@/server/schemas/attendance.schema";
import { requireRole } from "@/server/permissions/student.ability";

export async function list(req: NextRequest) {
  try {
    await requireRole("Admin", "Teacher");
    const { searchParams } = new URL(req.url);
    const filters = {
      enrollmentId: searchParams.get("enrollment_id") ? Number(searchParams.get("enrollment_id")) : undefined,
      offeringId: searchParams.get("offering_id") ? Number(searchParams.get("offering_id")) : undefined,
      studentId: searchParams.get("student_id") ? Number(searchParams.get("student_id")) : undefined,
      startDate: searchParams.get("start_date") || undefined,
      endDate: searchParams.get("end_date") || undefined,
    };
    const [records, total] = await Promise.all([
      attendanceService.list(filters),
      attendanceService.count(filters),
    ]);
    return NextResponse.json({ data: records, total });
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
    const record = await attendanceService.getById(Number(id));
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(record);
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
    const parsed = CreateAttendanceSchema.parse(body);
    const record = await attendanceService.create(parsed);
    return NextResponse.json(record, { status: 201 });
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
    const { attendance_id, ...data } = body;
    if (!attendance_id) return NextResponse.json({ error: "attendance_id required" }, { status: 400 });
    const parsed = UpdateAttendanceSchema.parse(data);
    const record = await attendanceService.update(attendance_id, parsed);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(record);
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
    await attendanceService.remove(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
