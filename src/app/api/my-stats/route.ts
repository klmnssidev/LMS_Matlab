import { NextResponse } from "next/server";
import { getStudentDashboardStats, getTeacherDashboardStats } from "@/services/stats";
import { ForbiddenError, getDbUserId, getUserRole } from "@/lib/rbac";

export async function GET() {
  try {
    const role = await getUserRole();
    const dbId = await getDbUserId();

    if (!role || !dbId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (role === "Teacher") {
      const stats = await getTeacherDashboardStats(dbId);
      const { listCourseOfferings } = await import("@/services/course-offerings");
      const offerings = await listCourseOfferings({ teacher_id: dbId });
      return NextResponse.json({ ...stats, offerings });
    }

    if (role === "Student") {
      const stats = await getStudentDashboardStats(dbId);
      return NextResponse.json(stats);
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    const status = error instanceof ForbiddenError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status });
  }
}
