import { authorizePage } from "@/permissions";
import { StudentForm } from "@/features/students/student-form";

export default async function NewStudentPage() {
  await authorizePage("create", "Student");
  return <StudentForm />;
}
