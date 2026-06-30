import { authorizePage } from "@/permissions";
import { ExamResultForm } from "@/features/exam-results/components/exam-result-form";

export default async function NewExamResultPage() {
  await authorizePage("create", "ExamResult");
  return <ExamResultForm />;
}
