import * as studentRepo from "@/server/repositories/student.repository";
import * as teacherRepo from "@/server/repositories/teacher.repository";
import * as adminRepo from "@/server/repositories/admin.repository";
import * as userAccountRepo from "@/server/repositories/user-account.repository";

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

export class StudentAlreadyLinkedError extends Error {
  code = "STUDENT_ALREADY_LINKED";
  status = 409;
}

export class TeacherAlreadyLinkedError extends Error {
  code = "TEACHER_ALREADY_LINKED";
  status = 409;
}

export type LinkedUser = {
  id: number;
  role: "ADMIN" | "STUDENT" | "TEACHER";
  userId: string;
  studentId?: number;
  studentName?: string;
  studentDepartmentId?: number;
  teacherId?: number;
  teacherName?: string;
  isActive: boolean;
};

function toLinkedUser(
  account: NonNullable<Awaited<ReturnType<typeof userAccountRepo.findByClerkId>>>,
  clerkUserId: string,
): LinkedUser | null {
  if (account.role === "STUDENT" && account.student) {
    return { id: account.id, role: "STUDENT", userId: clerkUserId, studentId: account.student.studentId, studentName: account.student.studentName, studentDepartmentId: account.student.departmentId, isActive: account.isActive };
  }
  if (account.role === "TEACHER" && account.teacher) {
    return { id: account.id, role: "TEACHER", userId: clerkUserId, teacherId: account.teacher.teacherId, teacherName: account.teacher.teacherName, isActive: account.isActive };
  }
  if (account.role === "ADMIN") {
    return { id: account.id, role: "ADMIN", userId: clerkUserId, isActive: account.isActive };
  }
  return null;
}

export async function getLinkedUser(clerkUserId: string): Promise<LinkedUser | null> {
  const account = await userAccountRepo.findByClerkId(clerkUserId);
  if (!account) return null;
  return toLinkedUser(account, clerkUserId);
}

export async function linkStudent(clerkUserId: string, studentNumber: string): Promise<LinkedUser> {
  const existing = await getLinkedUser(clerkUserId);
  if (existing) throw new AccountAlreadyLinkedError();

  const student = await studentRepo.findByStudentNumber(studentNumber);
  if (!student) throw new InvalidStudentNumberError();

  const alreadyLinked = await userAccountRepo.findByStudentId(student.studentId);
  if (alreadyLinked) throw new StudentAlreadyLinkedError();

  const account = await userAccountRepo.create({
    clerkUserId,
    email: student.email,
    role: "STUDENT",
    studentId: student.studentId,
  });

  const linked = toLinkedUser(account, clerkUserId);
  if (!linked) throw new Error("Failed to link account");
  return linked;
}

export async function linkTeacher(clerkUserId: string, employeeNumber: string): Promise<LinkedUser> {
  const existing = await getLinkedUser(clerkUserId);
  if (existing) throw new AccountAlreadyLinkedError();

  const teacher = await teacherRepo.findByEmployeeNumber(employeeNumber);
  if (!teacher) throw new InvalidEmployeeNumberError();

  const alreadyLinked = await userAccountRepo.findByTeacherId(teacher.teacherId);
  if (alreadyLinked) throw new TeacherAlreadyLinkedError();

  const account = await userAccountRepo.create({
    clerkUserId,
    email: teacher.email,
    role: "TEACHER",
    teacherId: teacher.teacherId,
  });

  const linked = toLinkedUser(account, clerkUserId);
  if (!linked) throw new Error("Failed to link account");
  return linked;
}

export async function linkAdmin(clerkUserId: string, email: string): Promise<LinkedUser> {
  const existing = await getLinkedUser(clerkUserId);
  if (existing) throw new AccountAlreadyLinkedError();

  const admin = await adminRepo.findByEmail(email);
  if (!admin) throw new Error("No admin record found for this email");

  const account = await userAccountRepo.create({
    clerkUserId,
    email,
    role: "ADMIN",
  });

  const linked = toLinkedUser(account, clerkUserId);
  if (!linked) throw new Error("Failed to link account");
  return linked;
}

export async function linkByEmail(clerkUserId: string, email: string): Promise<LinkedUser | null> {
  const existing = await userAccountRepo.findByEmail(email);
  if (existing) throw new AccountAlreadyLinkedError();

  const student = await studentRepo.findByEmail(email);
  if (student) {
    const alreadyLinked = await userAccountRepo.findByStudentId(student.studentId);
    if (alreadyLinked) throw new StudentAlreadyLinkedError();

    const account = await userAccountRepo.create({
      clerkUserId,
      email,
      role: "STUDENT",
      studentId: student.studentId,
    });

    const linked = toLinkedUser(account, clerkUserId);
    if (!linked) return null;
    return linked;
  }

  const teacher = await teacherRepo.findByEmail(email);
  if (teacher) {
    const alreadyLinked = await userAccountRepo.findByTeacherId(teacher.teacherId);
    if (alreadyLinked) throw new TeacherAlreadyLinkedError();

    const account = await userAccountRepo.create({
      clerkUserId,
      email,
      role: "TEACHER",
      teacherId: teacher.teacherId,
    });

    const linked = toLinkedUser(account, clerkUserId);
    if (!linked) return null;
    return linked;
  }

  const admin = await adminRepo.findByEmail(email);
  if (admin) {
    const account = await userAccountRepo.create({
      clerkUserId,
      email,
      role: "ADMIN",
    });

    const linked = toLinkedUser(account, clerkUserId);
    if (!linked) return null;
    return linked;
  }

  return null;
}
