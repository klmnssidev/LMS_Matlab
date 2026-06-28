import { NextRequest, NextResponse } from "next/server";
import * as offeringService from "@/server/services/course-offering.service";

export async function list(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const offering = await offeringService.getById(Number(id));
      if (!offering) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(offering);
    }
    const filter: Record<string, number | undefined> = {
      teacherId: searchParams.get("teacher_id") ? Number(searchParams.get("teacher_id")) : undefined,
      semesterId: searchParams.get("semester_id") ? Number(searchParams.get("semester_id")) : undefined,
      courseId: searchParams.get("course_id") ? Number(searchParams.get("course_id")) : undefined,
    };
    const offerings = await offeringService.list(filter);
    return NextResponse.json(offerings);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
