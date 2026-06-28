import { NextRequest, NextResponse } from "next/server";
import { listCourseOfferings, getCourseOffering } from "@/services/course-offerings";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const offering = await getCourseOffering(Number(id));
      if (!offering) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(offering);
    }
    const offerings = await listCourseOfferings({
      teacher_id: searchParams.get("teacher_id") ? Number(searchParams.get("teacher_id")) : undefined,
      semester_id: searchParams.get("semester_id") ? Number(searchParams.get("semester_id")) : undefined,
      course_id: searchParams.get("course_id") ? Number(searchParams.get("course_id")) : undefined,
    });
    return NextResponse.json(offerings);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
