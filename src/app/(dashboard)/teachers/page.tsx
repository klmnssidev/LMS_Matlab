import { authorizePage } from "@/permissions";
import { TeacherList } from "@/features/teachers/teacher-list";

export default async function TeachersPage() {
  await authorizePage("read", "Teacher");
  return <TeacherList />;
}
