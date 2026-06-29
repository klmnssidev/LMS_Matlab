import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import * as statsService from "@/server/services/stats.service";
import * as offeringService from "@/server/services/course-offering.service";
import * as accountLinkingService from "@/server/services/account-linking.service";
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
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const linked = await accountLinkingService.getLinkedUser(session.userId);
    if (!linked) {
      return NextResponse.json({ error: "ACCOUNT_NOT_LINKED" }, { status: 401 });
    }

    if (linked.type === "teacher") {
      const [stats, offerings] = await Promise.all([
        statsService.getTeacherStats(linked.record.teacherId),
        offeringService.listByTeacher(linked.record.teacherId),
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

    if (linked.type === "student") {
      const stats = await statsService.getStudentStats(linked.record.studentId);
      return NextResponse.json(stats);
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
