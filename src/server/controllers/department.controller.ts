import { NextResponse } from "next/server";
import * as departmentService from "@/server/services/department.service";
import { authorize } from "@/permissions";

export async function list() {
  try {
    await authorize("read", "Department");
    const departments = await departmentService.list();
    return NextResponse.json(departments);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
