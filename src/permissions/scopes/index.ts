import type { LinkedUser } from "@/server/services/account-linking.service";
import type { AuthorizationScope } from "@/permissions/authorization-scope";
import { buildAdminScope } from "@/permissions/scopes/admin.scope";
import { buildTeacherScope } from "@/permissions/scopes/teacher.scope";
import { buildStudentScope } from "@/permissions/scopes/student.scope";

export function buildScope(account: LinkedUser): AuthorizationScope {
  switch (account.role) {
    case "ADMIN":
      return buildAdminScope(account);
    case "TEACHER":
      return buildTeacherScope(account);
    case "STUDENT":
      return buildStudentScope(account);
  }
}
