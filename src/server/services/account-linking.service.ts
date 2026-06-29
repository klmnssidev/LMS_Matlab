import * as studentRepo from "@/server/repositories/student.repository";
import * as teacherRepo from "@/server/repositories/teacher.repository";

export class AccountNotLinkedError extends Error {
  code = "ACCOUNT_NOT_LINKED";
  status = 401;
}

export class InvalidStudentNumberError extends Error {
  code = "INVALID_STUDENT_NUMBER";
  status = 400;
}

export class InvalidEmployeeNumberError extends Error {
  code = "INVALID_EMPLOYEE_NUMBER";
  status = 400;
}

export class AccountAlreadyLinkedError extends Error {
  code = "ACCOUNT_ALREADY_LINKED";
  status = 409;
}

export type LinkedUser =
  | { type: "student"; record: NonNullable<Awaited<ReturnType<typeof studentRepo.findByClerkId>>> }
  | { type: "teacher"; record: NonNullable<Awaited<ReturnType<typeof teacherRepo.findByClerkId>>> };

export async function getLinkedUser(clerkUserId: string): Promise<LinkedUser | null> {
  const student = await studentRepo.findByClerkId(clerkUserId);
  if (student) return { type: "student", record: student };

  const teacher = await teacherRepo.findByClerkId(clerkUserId);
  if (teacher) return { type: "teacher", record: teacher };

  return null;
}

export async function linkStudent(clerkUserId: string, studentNumber: string): Promise<LinkedUser> {
  const existing = await getLinkedUser(clerkUserId);
  if (existing) throw new AccountAlreadyLinkedError();

  const student = await studentRepo.findByStudentNumber(studentNumber);
  if (!student) throw new InvalidStudentNumberError();

  await studentRepo.linkToClerk(student.studentId, clerkUserId);
  const linked = await studentRepo.findByClerkId(clerkUserId);
  if (!linked) throw new Error("Failed to link account");

  return { type: "student", record: linked };
}

export async function linkTeacher(clerkUserId: string, employeeNumber: string): Promise<LinkedUser> {
  const existing = await getLinkedUser(clerkUserId);
  if (existing) throw new AccountAlreadyLinkedError();

  const teacher = await teacherRepo.findByEmployeeNumber(employeeNumber);
  if (!teacher) throw new InvalidEmployeeNumberError();

  await teacherRepo.linkToClerk(teacher.teacherId, clerkUserId);
  const linked = await teacherRepo.findByClerkId(clerkUserId);
  if (!linked) throw new Error("Failed to link account");

  return { type: "teacher", record: linked };
}
