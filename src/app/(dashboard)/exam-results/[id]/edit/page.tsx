import { authorizePage } from "@/permissions";
import { ExamResultForm } from "@/features/exam-results/components/exam-result-form";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditExamResultPage({ params }: Props) {
  await authorizePage("update", "ExamResult");
  const raw = (await params).id.trim();
  if (!/^\d+$/.test(raw) || raw === "0") notFound();
  const resultId = Number(raw);
  return <ExamResultForm resultId={resultId} />;
}
