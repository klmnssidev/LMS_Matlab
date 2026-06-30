import * as studentRepo from "@/server/repositories/student.repository";

export type MyProfile = {
  studentId: number;
  studentName: string;
  email: string;
  studentNumber: string | null;
  phone: string | null;
  gender: string;
  dateOfBirth: string | null;
  admissionYear: number;
  status: string | null;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
};

export async function getMyProfile(studentId: number): Promise<MyProfile | null> {
  const student = await studentRepo.findById(studentId);
  if (!student) return null;

  return {
    studentId: student.studentId,
    studentName: student.studentName,
    email: student.email,
    studentNumber: student.studentNumber,
    phone: student.phone,
    gender: student.gender,
    dateOfBirth: student.dateOfBirth?.toISOString() ?? null,
    admissionYear: student.admissionYear,
    status: student.status,
    departmentId: student.departmentId,
    departmentName: student.department.departmentName,
    departmentCode: student.department.departmentCode,
  };
}
