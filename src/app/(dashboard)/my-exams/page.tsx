import { authorizePage } from "@/permissions";
import { MyExams } from "@/features/exams/my-exams";

export default async function MyExamsPage() {
  await authorizePage("read", "MyExams");
  return <MyExams />;
}
