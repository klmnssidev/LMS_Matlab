import { authorizePage } from "@/permissions";
import { ClassroomList } from "@/features/classrooms/components/classroom-list";

export default async function ClassroomsPage() {
  await authorizePage("read", "Classroom");
  return <ClassroomList />;
}
