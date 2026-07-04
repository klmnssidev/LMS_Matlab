import { authorizePage } from "@/permissions";
import { ExamForm } from "@/features/exams/components/exam-form";

export default async function NewExamPage() {
  await authorizePage("create", "Exam");
  return <ExamForm />;
}
