import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/stats";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole("Admin");
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
