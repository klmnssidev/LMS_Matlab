import { NextRequest, NextResponse } from "next/server";
import * as attendanceService from "@/server/services/attendance.service";
import { CreateAttendanceSchema, UpdateAttendanceSchema } from "@/server/schemas/attendance.schema";
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
    authz.authorize("read", isSelf ? "MyAttendance" : "Attendance");

    const filters = {
      enrollmentId: searchParams.get("enrollment_id") ? Number(searchParams.get("enrollment_id")) : undefined,
      offeringId: searchParams.get("offering_id") ? Number(searchParams.get("offering_id")) : undefined,
      studentId: searchParams.get("student_id") ? Number(searchParams.get("student_id")) : undefined,
      startDate: searchParams.get("start_date") || undefined,
      endDate: searchParams.get("end_date") || undefined,
    };
    const [records, total] = await Promise.all([
      attendanceService.list(filters, authz.scope),
      attendanceService.count(filters, authz.scope),
    ]);
    return NextResponse.json({ data: records, total });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getById(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "Attendance");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const record = await attendanceService.getById(Number(id), authz.scope);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(record);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function create(req: NextRequest) {
  try {
    await authorize("create", "Attendance");
    const body = await req.json();
    const parsed = CreateAttendanceSchema.parse(body);
    const record = await attendanceService.create(parsed);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) return zodErrorResponse(error);
    return errorResponse(error);
  }
}

export async function update(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("update", "Attendance");
    const body = await req.json();
    const { attendance_id, ...data } = body;
    if (!attendance_id) return NextResponse.json({ error: "attendance_id required" }, { status: 400 });

    const record = await attendanceService.update(attendance_id, data, authz.scope);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(record);
  } catch (error) {
    if (error instanceof Error && "issues" in error) return zodErrorResponse(error);
    return errorResponse(error);
  }
}

export async function remove(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("delete", "Attendance");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const result = await attendanceService.remove(Number(id), authz.scope);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
