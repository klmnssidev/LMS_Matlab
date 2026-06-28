import { NextResponse } from "next/server";
import { listDepartments } from "@/services/departments";

export async function GET() {
  try {
    const departments = await listDepartments();
    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
