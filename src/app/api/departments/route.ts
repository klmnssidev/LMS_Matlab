import { NextResponse } from "next/server";
import { listDepartments } from "@/services/departments";

export async function GET() {
  try {
    const departments = await listDepartments();
    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status: 500 });
  }
}
