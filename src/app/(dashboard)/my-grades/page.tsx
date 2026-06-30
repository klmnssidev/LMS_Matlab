import { authorizePage } from "@/permissions";
import { MyGrades } from "@/features/enrollments/my-grades";

export default async function MyGradesPage() {
  await authorizePage("read", "MyGrades");
  return <MyGrades />;
}
