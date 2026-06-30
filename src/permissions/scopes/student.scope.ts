import type { LinkedUser } from "@/server/services/account-linking.service";

export type StudentScope = {
  role: "Student";
  accountId: number;
  studentId: number;
  departmentId: number;
};

export function buildStudentScope(account: LinkedUser): StudentScope {
  return { role: "Student", accountId: account.id, studentId: account.studentId!, departmentId: account.studentDepartmentId! };
}
