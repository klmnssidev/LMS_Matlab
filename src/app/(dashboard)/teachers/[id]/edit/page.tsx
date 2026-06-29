import { TeacherForm } from "@/features/teachers/components/teacher-form";

export default async function EditTeacherPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeacherForm key={id} initial={{ teacher_id: Number(id) }} />;
}
