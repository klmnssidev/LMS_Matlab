import { NextRequest, NextResponse } from "next/server";
import { listCourses, getCourse, createCourse, updateCourse, deleteCourse } from "@/services/courses";
import { requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const course = await getCourse(Number(id));
      if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(course);
    }
    const department_id = searchParams.get("department_id");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");
    const courses = await listCourses({
      department_id: department_id ? Number(department_id) : undefined,
      search: search || undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("Admin");
    const body = await req.json();
    const course = await createCourse(body);
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireRole("Admin");
    const body = await req.json();
    const { course_id, ...data } = body;
    if (!course_id) return NextResponse.json({ error: "course_id required" }, { status: 400 });
    const course = await updateCourse(course_id, data);
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(course);
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
    const ok = await deleteCourse(Number(id));
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
