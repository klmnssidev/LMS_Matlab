import type { AdminScope } from "@/permissions/scopes/admin.scope";
import type { TeacherScope } from "@/permissions/scopes/teacher.scope";
import type { StudentScope } from "@/permissions/scopes/student.scope";

export type AuthorizationScope = AdminScope | TeacherScope | StudentScope;
