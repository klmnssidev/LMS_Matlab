import * as offeringRepo from "@/server/repositories/course-offering.repository";
import type { OfferingFilters } from "@/server/repositories/course-offering.repository";
import type { CourseOfferingJoined } from "@/server/schemas/course-offering.schema";

export async function list(filters: OfferingFilters) {
  const rows = await offeringRepo.findMany(filters);
  return rows.map(toJoined);
}

export async function getById(id: number) {
  const row = await offeringRepo.findById(id);
  if (!row) return null;
  return toJoined(row);
}

export async function listByTeacher(teacherId: number) {
  const rows = await offeringRepo.findMany({ teacherId });
  return rows.map(toJoined);
}

function toJoined(row: Awaited<ReturnType<typeof offeringRepo.findMany>>[number]): CourseOfferingJoined {
  return {
    offeringId: row.offeringId,
    courseId: row.courseId,
    teacherId: row.teacherId,
    semesterId: row.semesterId,
    classroomId: row.classroomId,
    sectionName: row.sectionName,
    maxStudents: row.maxStudents,
    courseCode: row.course.courseCode,
    courseName: row.course.courseName,
    teacherName: row.teacher.teacherName,
    semesterName: row.semester.semesterName,
    roomCode: row.classroom.roomCode,
  };
}
