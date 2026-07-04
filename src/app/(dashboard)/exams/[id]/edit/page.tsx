import { authorizePage } from "@/permissions";
import { ExamForm } from "@/features/exams/components/exam-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditExamPage({ params }: Props) {
  await authorizePage("update", "Exam");
  const { id } = await params;
  return <ExamForm examId={Number(id)} />;
}
