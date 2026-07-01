import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { AppAbility } from "../types";

export function defineTeacherAbility(): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  can(["read"], [
    "Teacher",
    "CourseOffering",
    "Enrollment",
    "Attendance",
    "Exam",
    "ExamResult",
    "Student",
  ]);
  can(["create", "update"], ["Attendance", "Exam", "ExamResult"]);
  can(["delete"], ["Exam", "ExamResult"]);

  can("read", ["Course", "Department", "Semester", "Classroom", "Poster"]);
  can("read", ["Dashboard", "Analytics"]);

  return build();
}
