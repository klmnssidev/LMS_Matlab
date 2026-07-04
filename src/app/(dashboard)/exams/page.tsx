import { authorizePage } from "@/permissions";
import { ExamList } from "@/features/exams/components/exam-list";

export default async function ExamsPage() {
  await authorizePage("read", "Exam");
  return <ExamList />;
}
