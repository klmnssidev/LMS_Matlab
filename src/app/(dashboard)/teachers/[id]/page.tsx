import { TeacherProfile } from "@/features/teachers/teacher-profile";

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TeacherProfile id={Number(id)} />;
}
