import { NextResponse } from "next/server";
import * as semesterService from "@/server/services/semester.service";

export async function list() {
  try {
    const semesters = await semesterService.list();
    return NextResponse.json(semesters);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
