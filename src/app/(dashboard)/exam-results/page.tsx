import { authorizePage } from "@/permissions";
import { ExamResultList } from "@/features/exam-results/components/exam-result-list";

export default async function ExamResultsPage() {
  await authorizePage("read", "ExamResult");
  return <ExamResultList />;
}
