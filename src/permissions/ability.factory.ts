import { defineAdminAbility } from "@/permissions/abilities/admin.ability";
import { defineTeacherAbility } from "@/permissions/abilities/teacher.ability";
import { defineStudentAbility } from "@/permissions/abilities/student.ability";
import type { LinkedUser } from "@/server/services/account-linking.service";
import type { AppAbility } from "@/permissions/types";

export function buildAbility(account: LinkedUser): AppAbility {
  switch (account.role) {
    case "ADMIN":
      return defineAdminAbility();
    case "TEACHER":
      return defineTeacherAbility();
    case "STUDENT":
      return defineStudentAbility();
  }
}
