import { authorizePage } from "@/permissions";
import { ExamResultForm } from "@/features/exam-results/components/exam-result-form";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditExamResultPage({ params }: Props) {
  await authorizePage("update", "ExamResult");
  const { id } = await params;
  const resultId = Number(id);
  if (!Number.isFinite(resultId)) notFound();
  return <ExamResultForm resultId={resultId} />;
}
