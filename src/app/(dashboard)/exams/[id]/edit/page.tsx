import { authorizePage } from "@/permissions";
import { ExamForm } from "@/features/exams/components/exam-form";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditExamPage({ params }: Props) {
  await authorizePage("update", "Exam");
  const { id } = await params;
  const examId = Number(id);
  if (!Number.isFinite(examId)) notFound();
  return <ExamForm examId={examId} />;
}
