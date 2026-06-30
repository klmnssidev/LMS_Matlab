import { authorizePage } from "@/permissions";
import { StudentProfile } from "@/features/students/student-profile";

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await authorizePage("read", "Student");
  const { id } = await params;
  return <StudentProfile id={Number(id)} />;
}
