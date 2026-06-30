import { authorizePage } from "@/permissions";
import { TeacherForm } from "@/features/teachers/components/teacher-form";

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  await authorizePage("update", "Teacher");
  const { id } = await params;
  return <TeacherForm key={id} initial={{ teacher_id: Number(id) }} />;
}
