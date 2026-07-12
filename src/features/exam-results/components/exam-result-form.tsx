"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCreateExamResult, useUpdateExamResult, useExamResult } from "@/features/exam-results/hooks/use-exam-results";
import { useExams } from "@/shared/hooks/use-exams";
import { useOfferings } from "@/features/course-offerings/hooks/use-course-offerings";

type FormValues = {
  examId: string;
  enrollmentId: string;
  score: string;
};

function toError(field: { message?: string } | undefined) {
  return field ? [{ message: field.message }] : undefined;
}

type ExamResultFormProps = {
  resultId?: number;
};

export function ExamResultForm({ resultId }: ExamResultFormProps) {
  const router = useRouter();
  const createExamResult = useCreateExamResult();
  const updateExamResult = useUpdateExamResult();
  const { data: fetchedResult } = useExamResult(resultId ?? null);
  const { data: exams } = useExams();
  const { data: offeringsData } = useOfferings();
  const isEdit = !!resultId;

  const maxScore = useMemo(() => {
    if (isEdit && fetchedResult) return fetchedResult.maxScore;
    return 100;
  }, [isEdit, fetchedResult]);

  const formSchema = useMemo(() => z.object({
    examId: z.string().min(1, "Exam is required"),
    enrollmentId: z.string().min(1, "Enrollment is required"),
    score: z.string().min(1, "Score is required"),
  }).superRefine((data, ctx) => {
    const numScore = Number(data.score);
    if (numScore > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Score cannot exceed 100",
        path: ["score"],
      });
    }
    if (numScore > maxScore) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Score cannot exceed exam max score (${maxScore})`,
        path: ["score"],
      });
    }
  }), [maxScore]);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      examId: "",
      enrollmentId: "",
      score: "",
    },
  });

  useEffect(() => {
    if (fetchedResult) {
      reset({
        examId: String(fetchedResult.examId),
        enrollmentId: String(fetchedResult.enrollmentId),
        score: String(fetchedResult.score),
      });
    }
  }, [fetchedResult, reset]);

  const isPending = createExamResult.isPending || updateExamResult.isPending;

  const onSubmit = async (values: FormValues) => {
    if (isEdit && fetchedResult) {
      await updateExamResult.mutateAsync({
        result_id: fetchedResult.resultId,
        score: Number(values.score),
      });
    } else {
      await createExamResult.mutateAsync({
        examId: Number(values.examId),
        enrollmentId: Number(values.enrollmentId),
        score: Number(values.score),
      });
    }
    router.push("/exam-results");
    router.refresh();
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Exam Result" : "New Exam Result"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              name="examId"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.examId}>
                  <FieldLabel htmlFor="examId">Exam</FieldLabel>
                  <Select
                    items={(exams ?? []).map((e) => ({ label: `${e.offering.course.courseCode} - ${e.examType} (${e.examDate})`, value: String(e.examId) }))}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                    disabled={isEdit}
                  >
                    <SelectTrigger id="examId"><SelectValue placeholder="Select exam" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(exams ?? []).map((e) => (
                          <SelectItem key={e.examId} value={String(e.examId)}>{e.offering.course.courseCode} - {e.examType} ({e.examDate})</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={toError(errors.examId)} />
                </Field>
              )}
            />
            <Controller
              name="enrollmentId"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.enrollmentId}>
                  <FieldLabel htmlFor="enrollmentId">Enrollment</FieldLabel>
                  <Select
                    items={(offeringsData?.data ?? []).flatMap((o) =>
                      (o as unknown as { enrollments?: { enrollmentId: number; studentName: string }[] }).enrollments?.map((e) => ({
                        label: `${o.courseName} - ${e.studentName}`,
                        value: String(e.enrollmentId),
                      })) ?? []
                    )}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                    disabled={isEdit}
                  >
                    <SelectTrigger id="enrollmentId"><SelectValue placeholder="Select enrollment" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(offeringsData?.data ?? []).flatMap((o) =>
                          (o as unknown as { enrollments?: { enrollmentId: number; studentName: string }[] }).enrollments?.map((e) => (
                            <SelectItem key={e.enrollmentId} value={String(e.enrollmentId)}>{o.courseName} - {e.studentName}</SelectItem>
                          )) ?? []
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={toError(errors.enrollmentId)} />
                </Field>
              )}
            />
            <Field data-invalid={!!errors.score}>
              <FieldLabel htmlFor="score">Score (max {maxScore})</FieldLabel>
              <Input id="score" type="number" step="0.01" max={maxScore} {...register("score")} />
              <FieldError errors={toError(errors.score)} />
            </Field>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
