import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { AppAbility } from "../types";

export function defineAdminAbility(): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  const adminSubjects = [
    "Dashboard",
    "Analytics",
    "Settings",
    "MyProfile",
    "Department",
    "Teacher",
    "Student",
    "Course",
    "Semester",
    "Classroom",
    "CourseOffering",
    "Enrollment",
    "Attendance",
    "Exam",
    "ExamResult",
    "Poster",
  ] as const;

  for (const subject of adminSubjects) {
    can("manage", subject);
  }

  return build();
}
