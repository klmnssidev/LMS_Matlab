import { NextResponse } from "next/server";
import * as examService from "@/server/services/exam.service";

export async function list() {
  try {
    const exams = await examService.list();
    return NextResponse.json(exams);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
