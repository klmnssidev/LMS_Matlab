import * as courseOfferingRepo from "@/server/repositories/course-offering.repository";
import type { AuthorizationScope } from "@/permissions";

export type ScheduleEntry = {
  offeringId: number;
  courseCode: string;
  courseName: string;
  sectionName: string;
  teacherName: string;
  roomCode: string;
  dayOfWeek: number | null;
  startTime: string | null;
  endTime: string | null;
};

export async function getMySchedule(scope: AuthorizationScope): Promise<ScheduleEntry[]> {
  const offerings = await courseOfferingRepo.findMany({}, scope);

  return offerings
    .filter((o) => o.dayOfWeek != null)
    .map((o) => ({
      offeringId: o.offeringId,
      courseCode: o.course.courseCode,
      courseName: o.course.courseName,
      sectionName: o.sectionName,
      teacherName: o.teacher.teacherName,
      roomCode: o.classroom.roomCode,
      dayOfWeek: o.dayOfWeek,
      startTime: o.startTime,
      endTime: o.endTime,
    }));
}
