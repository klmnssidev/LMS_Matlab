"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCreateExam, useUpdateExam, useExam } from "@/features/exams/hooks/use-exams";
import { useOfferings } from "@/features/course-offerings/hooks/use-course-offerings";
import type { ExamJoined } from "@/server/schemas/exam.schema";

const formSchema = z.object({
  offeringId: z.string().min(1, "Course offering is required"),
  examType: z.string().min(1, "Exam type is required"),
  examDate: z.string().min(1, "Date is required"),
  maxScore: z.string().min(1, "Max score is required"),
});

type FormValues = z.infer<typeof formSchema>;

function toError(field: { message?: string } | undefined) {
  return field ? [{ message: field.message }] : undefined;
}

type ExamFormProps = {
  initialData?: ExamJoined;
  examId?: number;
};

export function ExamForm({ initialData, examId }: ExamFormProps) {
  const router = useRouter();
  const createExam = useCreateExam();
  const updateExam = useUpdateExam();
  const { data: offeringsData } = useOfferings();
  const { data: fetchedExam } = useExam(examId ?? null);
  const editData = initialData ?? fetchedExam;
  const isEdit = !!editData;

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: editData ? {
      offeringId: String(editData.offeringId),
      examType: editData.examType,
      examDate: editData.examDate,
      maxScore: String(editData.maxScore),
    } : {
      offeringId: "",
      examType: "",
      examDate: new Date().toISOString().split("T")[0],
      maxScore: "",
    },
  });

  useEffect(() => {
    if (editData) {
      reset({
        offeringId: String(editData.offeringId),
        examType: editData.examType,
        examDate: editData.examDate,
        maxScore: String(editData.maxScore),
      });
    }
  }, [editData, reset]);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    try {
      if (isEdit) {
        await updateExam.mutateAsync({
          exam_id: editData.examId,
          offeringId: Number(values.offeringId),
          examType: values.examType,
          examDate: values.examDate,
          maxScore: Number(values.maxScore),
        });
      } else {
        await createExam.mutateAsync({
          offeringId: Number(values.offeringId),
          examType: values.examType,
          examDate: values.examDate,
          maxScore: Number(values.maxScore),
        });
      }
      router.push("/exams");
      router.refresh();
    } catch {
      setSubmitError("Failed to save exam. Please try again.");
    }
  };

  const offerings = offeringsData?.data ?? [];

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Exam" : "New Exam"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              name="offeringId"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.offeringId}>
                  <FieldLabel htmlFor="offeringId">Course Offering</FieldLabel>
                  <Select
                    items={offerings.map((o) => ({
                      label: `${o.courseCode} - ${o.sectionName} (${o.semesterName})`,
                      value: String(o.offeringId),
                    }))}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger id="offeringId"><SelectValue placeholder="Select offering" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {offerings.map((o) => (
                          <SelectItem key={o.offeringId} value={String(o.offeringId)}>
                            {o.courseCode} - {o.sectionName} ({o.semesterName})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={toError(errors.offeringId)} />
                </Field>
              )}
            />
            <Controller
              name="examType"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.examType}>
                  <FieldLabel htmlFor="examType">Exam Type</FieldLabel>
                  <Select
                    items={[
                      { label: "Midterm", value: "Midterm" },
                      { label: "Final", value: "Final" },
                      { label: "Quiz", value: "Quiz" },
                    ]}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger id="examType"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Midterm">Midterm</SelectItem>
                        <SelectItem value="Final">Final</SelectItem>
                        <SelectItem value="Quiz">Quiz</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={toError(errors.examType)} />
                </Field>
              )}
            />
            <Field data-invalid={!!errors.examDate}>
              <FieldLabel htmlFor="examDate">Exam Date</FieldLabel>
              <Input id="examDate" type="date" {...register("examDate")} />
              <FieldError errors={toError(errors.examDate)} />
            </Field>
            <Field data-invalid={!!errors.maxScore}>
              <FieldLabel htmlFor="maxScore">Max Score</FieldLabel>
              <Input id="maxScore" type="number" step="0.01" {...register("maxScore")} />
              <FieldError errors={toError(errors.maxScore)} />
            </Field>
            {submitError && <p className="text-sm text-destructive">{submitError}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createExam.isPending || updateExam.isPending}>
                {createExam.isPending || updateExam.isPending ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
