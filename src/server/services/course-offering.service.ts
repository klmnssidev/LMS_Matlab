import * as offeringRepo from "@/server/repositories/course-offering.repository";
import type { OfferingFilters } from "@/server/repositories/course-offering.repository";
import type { CourseOfferingJoined, CourseOffering as CourseOfferingFlat } from "@/server/schemas/course-offering.schema";

export async function list(filters: OfferingFilters = {}) {
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

export async function create(data: { courseId: number; teacherId: number; semesterId: number; classroomId: number; sectionName?: string; maxStudents?: number }): Promise<CourseOfferingFlat> {
  const row = await offeringRepo.create({
    sectionName: data.sectionName ?? "A",
    maxStudents: data.maxStudents ?? 40,
    course: { connect: { courseId: data.courseId } },
    teacher: { connect: { teacherId: data.teacherId } },
    semester: { connect: { semesterId: data.semesterId } },
    classroom: { connect: { classroomId: data.classroomId } },
  });
  return {
    offeringId: row.offeringId,
    courseId: row.courseId,
    teacherId: row.teacherId,
    semesterId: row.semesterId,
    classroomId: row.classroomId,
    sectionName: row.sectionName,
    maxStudents: row.maxStudents,
  };
}

export async function update(id: number, data: Partial<{ courseId: number; teacherId: number; semesterId: number; classroomId: number; sectionName: string; maxStudents: number }>): Promise<CourseOfferingFlat> {
  const updateData: Record<string, unknown> = {};
  if (data.sectionName !== undefined) updateData.sectionName = data.sectionName;
  if (data.maxStudents !== undefined) updateData.maxStudents = data.maxStudents;
  if (data.courseId !== undefined) updateData.course = { connect: { courseId: data.courseId } };
  if (data.teacherId !== undefined) updateData.teacher = { connect: { teacherId: data.teacherId } };
  if (data.semesterId !== undefined) updateData.semester = { connect: { semesterId: data.semesterId } };
  if (data.classroomId !== undefined) updateData.classroom = { connect: { classroomId: data.classroomId } };

  const row = await offeringRepo.update(id, updateData);
  return {
    offeringId: row.offeringId,
    courseId: row.courseId,
    teacherId: row.teacherId,
    semesterId: row.semesterId,
    classroomId: row.classroomId,
    sectionName: row.sectionName,
    maxStudents: row.maxStudents,
  };
}

export async function remove(id: number) {
  return offeringRepo.remove(id);
}

export async function count(filters: OfferingFilters = {}) {
  return offeringRepo.count(filters);
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
