import { NextResponse } from "next/server";
import * as statsService from "@/server/services/stats.service";
import * as offeringService from "@/server/services/course-offering.service";
import { requireRole } from "@/server/permissions/student.ability";

export async function getAdminDashboard() {
  try {
    await requireRole("Admin");
    const stats = await statsService.getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function getMyStats() {
  try {
    const { currentUser } = await import("@clerk/nextjs/server");
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const role = user.publicMetadata.role as string;
    const dbId = user.publicMetadata.db_id as number;

    if (!role || !dbId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (role === "Teacher") {
      const [stats, offerings] = await Promise.all([
        statsService.getTeacherStats(dbId),
        offeringService.listByTeacher(dbId),
      ]);
      return NextResponse.json({
        ...stats,
        offerings: offerings.map((o) => ({
          offering_id: o.offeringId,
          course_code: o.courseCode,
          course_name: o.courseName,
          section_name: o.sectionName,
          semester_name: o.semesterName,
          room_code: o.roomCode,
          max_students: o.maxStudents,
        })),
      });
    }

    if (role === "Student") {
      const stats = await statsService.getStudentStats(dbId);
      return NextResponse.json(stats);
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
