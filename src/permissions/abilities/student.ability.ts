import { AbilityBuilder, createMongoAbility } from "@casl/ability";
import type { AppAbility } from "../types";

export function defineStudentAbility(): AppAbility {
  const { can, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

  can("read", ["Course", "Poster"]);
  can("read", ["MyEnrollments", "MyGrades", "MyProfile", "MyAttendance", "MyExams", "MySchedule"]);
  can("read", "Dashboard");

  return build();
}
