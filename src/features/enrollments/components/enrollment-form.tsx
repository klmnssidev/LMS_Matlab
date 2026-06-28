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
import { useCreateEnrollment } from "@/features/enrollments/hooks/use-enrollments";
import { useStudents } from "@/features/students/hooks/use-students";
import { useOfferings } from "@/features/course-offerings/hooks/use-course-offerings";

const formSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  offeringId: z.string().min(1, "Course offering is required"),
  enrollmentDate: z.string().min(1, "Date is required"),
  status: z.string().min(1, "Status is required"),
});

type FormValues = z.infer<typeof formSchema>;

const statusItems = [
  { label: "Active", value: "Active" },
  { label: "Completed", value: "Completed" },
  { label: "Dropped", value: "Dropped" },
];

function toError(field: { message?: string } | undefined) {
  return field ? [{ message: field.message }] : undefined;
}

export function EnrollmentForm() {
  const router = useRouter();
  const createEnrollment = useCreateEnrollment();
  const { data: studentsData } = useStudents({});
  const { data: offeringsData } = useOfferings();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enrollmentDate: new Date().toISOString().split("T")[0],
      status: "Active",
    },
  });

  const onSubmit = async (values: FormValues) => {
    await createEnrollment.mutateAsync({
      studentId: Number(values.studentId),
      offeringId: Number(values.offeringId),
      enrollmentDate: values.enrollmentDate,
      status: values.status,
    });
    router.push("/enrollments");
    router.refresh();
  };

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>New Enrollment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              name="studentId"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.studentId}>
                  <FieldLabel htmlFor="studentId">Student</FieldLabel>
                  <Select items={(studentsData?.data ?? []).map((s) => ({ label: s.studentName, value: String(s.studentId) }))} value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger id="studentId"><SelectValue placeholder="Select student" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(studentsData?.data ?? []).map((s) => (
                          <SelectItem key={s.studentId} value={String(s.studentId)}>{s.studentName}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={toError(errors.studentId)} />
                </Field>
              )}
            />
            <Controller
              name="offeringId"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.offeringId}>
                  <FieldLabel htmlFor="offeringId">Course Offering</FieldLabel>
                  <Select items={(offeringsData?.data ?? []).map((o) => ({ label: `${o.courseCode} - ${o.courseName} (${o.sectionName})`, value: String(o.offeringId) }))} value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger id="offeringId"><SelectValue placeholder="Select offering" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(offeringsData?.data ?? []).map((o) => (
                          <SelectItem key={o.offeringId} value={String(o.offeringId)}>{o.courseCode} - {o.courseName} ({o.sectionName})</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={toError(errors.offeringId)} />
                </Field>
              )}
            />
            <Field data-invalid={!!errors.enrollmentDate}>
              <FieldLabel htmlFor="enrollmentDate">Enrollment Date</FieldLabel>
              <Input id="enrollmentDate" type="date" {...register("enrollmentDate")} />
              <FieldError errors={toError(errors.enrollmentDate)} />
            </Field>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.status}>
                  <FieldLabel htmlFor="status">Status</FieldLabel>
                  <Select items={statusItems} value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {statusItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={toError(errors.status)} />
                </Field>
              )}
            />
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createEnrollment.isPending}>
                {createEnrollment.isPending ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
