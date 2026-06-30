import type { LinkedUser } from "@/server/services/account-linking.service";

export type TeacherScope = {
  role: "Teacher";
  accountId: number;
  teacherId: number;
};

export function buildTeacherScope(account: LinkedUser): TeacherScope {
  return { role: "Teacher", accountId: account.id, teacherId: account.teacherId! };
}
