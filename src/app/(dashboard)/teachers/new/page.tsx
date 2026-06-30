import { authorizePage } from "@/permissions";
import { TeacherForm } from "@/features/teachers/components/teacher-form";

export default async function NewTeacherPage() {
  await authorizePage("create", "Teacher");
  return <TeacherForm />;
}
