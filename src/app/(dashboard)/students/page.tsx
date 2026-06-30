import { authorizePage } from "@/permissions";
import { StudentList } from "@/features/students/student-list";

export default async function StudentsPage() {
  await authorizePage("read", "Student");
  return <StudentList />;
}
