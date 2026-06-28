"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCreateExamResult } from "@/features/exam-results/hooks/use-exam-results";
import { useExams } from "@/shared/hooks/use-exams";
import { useOfferings } from "@/features/course-offerings/hooks/use-course-offerings";

const formSchema = z.object({
  examId: z.string().min(1, "Exam is required"),
  enrollmentId: z.string().min(1, "Enrollment is required"),
  score: z.string().min(1, "Score is required"),
});

type FormValues = z.infer<typeof formSchema>;

function toError(field: { message?: string } | undefined) {
  return field ? [{ message: field.message }] : undefined;
}

export function ExamResultForm() {
  const router = useRouter();
  const createExamResult = useCreateExamResult();
  const { data: exams } = useExams();
  const { data: offeringsData } = useOfferings();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: FormValues) => {
    await createExamResult.mutateAsync({
      examId: Number(values.examId),
      enrollmentId: Number(values.enrollmentId),
      score: Number(values.score),
    });
    router.push("/exam-results");
    router.refresh();
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>New Exam Result</CardTitle>
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
              <FieldLabel htmlFor="score">Score</FieldLabel>
              <Input id="score" type="number" step="0.01" {...register("score")} />
              <FieldError errors={toError(errors.score)} />
            </Field>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createExamResult.isPending}>
                {createExamResult.isPending ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
