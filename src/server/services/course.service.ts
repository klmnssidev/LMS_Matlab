import * as courseRepo from "@/server/repositories/course.repository";
import type { CourseFilters } from "@/server/repositories/course.repository";
import type { CreateCourse, UpdateCourse, CourseWithDept } from "@/server/schemas/course.schema";

function toCourseWithDept(row: Awaited<ReturnType<typeof courseRepo.findMany>>[number]): CourseWithDept {
  return {
    courseId: row.courseId,
    departmentId: row.departmentId,
    courseCode: row.courseCode,
    courseName: row.courseName,
    creditHours: row.creditHours,
    departmentName: row.department.departmentName,
    departmentCode: row.department.departmentCode,
  };
}

export async function list(filters: CourseFilters) {
  const rows = await courseRepo.findMany(filters);
  return rows.map(toCourseWithDept);
}

export async function getById(id: number) {
  const row = await courseRepo.findById(id);
  if (!row) return null;

  return {
    ...toCourseWithDept(row),
    offerings: row.courseOfferings.map((o) => ({
      offeringId: o.offeringId,
      sectionName: o.sectionName,
      teacherName: o.teacher.teacherName,
      semesterName: o.semester.semesterName,
      roomCode: o.classroom.roomCode,
    })),
  };
}

export async function create(data: CreateCourse) {
  const row = await courseRepo.create({
    courseCode: data.courseCode,
    courseName: data.courseName,
    creditHours: data.creditHours,
    department: { connect: { departmentId: data.departmentId } },
  });
  return row;
}

export async function update(id: number, data: UpdateCourse) {
  const updateData: Record<string, unknown> = {};
  if (data.courseCode !== undefined) updateData.courseCode = data.courseCode;
  if (data.courseName !== undefined) updateData.courseName = data.courseName;
  if (data.creditHours !== undefined) updateData.creditHours = data.creditHours;
  if (data.departmentId !== undefined) updateData.department = { connect: { departmentId: data.departmentId } };

  const row = await courseRepo.update(id, updateData);
  return row;
}

export async function remove(id: number) {
  return courseRepo.remove(id);
}

export async function count(filters: Omit<CourseFilters, "limit" | "offset">) {
  return courseRepo.count(filters);
}
