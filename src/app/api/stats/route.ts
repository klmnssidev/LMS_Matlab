import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/stats";
import { ForbiddenError, requireRole } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole("Admin");
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    const status = error instanceof ForbiddenError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status });
  }
}
