import { NextResponse } from "next/server";
import * as classroomService from "@/server/services/classroom.service";
import { authorize } from "@/permissions";

export async function list() {
  try {
    await authorize("read", "Classroom");
    const classrooms = await classroomService.list();
    return NextResponse.json(classrooms);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
