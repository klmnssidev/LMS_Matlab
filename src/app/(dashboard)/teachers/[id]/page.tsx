import { authorizePage } from "@/permissions";
import { TeacherProfile } from "@/features/teachers/teacher-profile";

export default async function TeacherProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await authorizePage("read", "Teacher");
  const { id } = await params;
  return <TeacherProfile id={Number(id)} />;
}
