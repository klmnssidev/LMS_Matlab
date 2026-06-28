import { NextRequest, NextResponse } from "next/server";
import { listEnrollments, getEnrollment, createEnrollment, updateEnrollment, deleteEnrollment } from "@/services/enrollments";
import { requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const enrollment = await getEnrollment(Number(id));
      if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(enrollment);
    }
    const enrollments = await listEnrollments({
      student_id: searchParams.get("student_id") ? Number(searchParams.get("student_id")) : undefined,
      offering_id: searchParams.get("offering_id") ? Number(searchParams.get("offering_id")) : undefined,
      status: searchParams.get("status") || undefined,
    });
    return NextResponse.json(enrollments);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("Admin");
    const body = await req.json();
    const enrollment = await createEnrollment(body);
    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole("Admin", "Teacher");
    const body = await req.json();
    const { enrollment_id, ...data } = body;
    if (!enrollment_id) return NextResponse.json({ error: "enrollment_id required" }, { status: 400 });
    const enrollment = await updateEnrollment(enrollment_id, data);
    if (!enrollment) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(enrollment);
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
    const ok = await deleteEnrollment(Number(id));
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
