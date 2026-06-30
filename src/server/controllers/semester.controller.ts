import { NextResponse } from "next/server";
import * as semesterService from "@/server/services/semester.service";
import { authorize } from "@/permissions";

export async function list() {
  try {
    await authorize("read", "Semester");
    const semesters = await semesterService.list();
    return NextResponse.json(semesters);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
