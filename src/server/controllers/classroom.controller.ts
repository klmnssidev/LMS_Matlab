import { NextResponse } from "next/server";
import * as classroomService from "@/server/services/classroom.service";

export async function list() {
  try {
    const classrooms = await classroomService.list();
    return NextResponse.json(classrooms);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
