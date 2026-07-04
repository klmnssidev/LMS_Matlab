import { authorizePage } from "@/permissions";
import { SemesterList } from "@/features/semesters/components/semester-list";

export default async function SemestersPage() {
  await authorizePage("read", "Semester");
  return <SemesterList />;
}
