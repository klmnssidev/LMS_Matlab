import { NextResponse } from "next/server";
import * as departmentService from "@/server/services/department.service";

export async function list() {
  try {
    const departments = await departmentService.list();
    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
