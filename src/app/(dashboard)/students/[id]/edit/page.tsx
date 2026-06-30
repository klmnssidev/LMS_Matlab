import { authorizePage } from "@/permissions";
import { StudentForm } from "@/features/students/student-form";

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  await authorizePage("update", "Student");
  const { id } = await params;
  return <StudentForm key={id} initial={{ student_id: Number(id) }} />;
}
