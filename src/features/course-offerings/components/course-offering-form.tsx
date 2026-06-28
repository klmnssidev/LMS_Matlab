"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { useCreateOffering, useUpdateOffering } from "@/features/course-offerings/hooks/use-course-offerings";
import { useCourses } from "@/features/courses/hooks/use-courses";
import { useTeachers } from "@/features/teachers/hooks/use-teachers";
import { useSemesters } from "@/shared/hooks/use-semesters";
import { useClassrooms } from "@/shared/hooks/use-classrooms";

const formSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  teacherId: z.string().min(1, "Teacher is required"),
  semesterId: z.string().min(1, "Semester is required"),
  classroomId: z.string().min(1, "Classroom is required"),
  sectionName: z.string().min(1, "Section is required").max(10),
  maxStudents: z.string().min(1, "Max students is required"),
});

type FormValues = z.infer<typeof formSchema>;

function toError(field: { message?: string } | undefined) {
  return field ? [{ message: field.message }] : undefined;
}

export function CourseOfferingForm({ initial }: { initial?: Partial<FormValues> & { offering_id?: number } }) {
  const router = useRouter();
  const createOffering = useCreateOffering();
  const updateOffering = useUpdateOffering();
  const { data: coursesData } = useCourses({});
  const { data: teachersData } = useTeachers({});
  const { data: semesters } = useSemesters();
  const { data: classrooms } = useClassrooms();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseId: initial?.courseId ?? "",
      teacherId: initial?.teacherId ?? "",
      semesterId: initial?.semesterId ?? "",
      classroomId: initial?.classroomId ?? "",
      sectionName: initial?.sectionName ?? "A",
      maxStudents: initial?.maxStudents ?? "40",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const payload = {
      ...(initial?.offering_id ? { offering_id: initial.offering_id } : {}),
      courseId: Number(values.courseId),
      teacherId: Number(values.teacherId),
      semesterId: Number(values.semesterId),
      classroomId: Number(values.classroomId),
      sectionName: values.sectionName,
      maxStudents: Number(values.maxStudents),
    };
    if (initial?.offering_id) {
      await updateOffering.mutateAsync(payload);
    } else {
      await createOffering.mutateAsync(payload);
    }
    router.push("/course-offerings");
    router.refresh();
  };

  const isPending = createOffering.isPending || updateOffering.isPending;

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>{initial?.offering_id ? "Edit" : "New"} Course Offering</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="gap-4">
            <Controller
              name="courseId"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.courseId}>
                  <FieldLabel htmlFor="courseId">Course</FieldLabel>
                  <Select items={(coursesData?.data ?? []).map((c) => ({ label: `${c.courseCode} - ${c.courseName}`, value: String(c.courseId) }))} value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger id="courseId"><SelectValue placeholder="Select course" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(coursesData?.data ?? []).map((c) => (
                          <SelectItem key={c.courseId} value={String(c.courseId)}>{c.courseCode} - {c.courseName}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={toError(errors.courseId)} />
                </Field>
              )}
            />
            <Controller
              name="teacherId"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.teacherId}>
                  <FieldLabel htmlFor="teacherId">Teacher</FieldLabel>
                  <Select items={(teachersData?.data ?? []).map((t) => ({ label: t.teacherName, value: String(t.teacherId) }))} value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger id="teacherId"><SelectValue placeholder="Select teacher" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(teachersData?.data ?? []).map((t) => (
                          <SelectItem key={t.teacherId} value={String(t.teacherId)}>{t.teacherName}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={toError(errors.teacherId)} />
                </Field>
              )}
            />
            <Controller
              name="semesterId"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.semesterId}>
                  <FieldLabel htmlFor="semesterId">Semester</FieldLabel>
                  <Select items={(semesters ?? []).map((s) => ({ label: s.semesterName, value: String(s.semesterId) }))} value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger id="semesterId"><SelectValue placeholder="Select semester" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(semesters ?? []).map((s) => (
                          <SelectItem key={s.semesterId} value={String(s.semesterId)}>{s.semesterName}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={toError(errors.semesterId)} />
                </Field>
              )}
            />
            <Controller
              name="classroomId"
              control={control}
              render={({ field }) => (
                <Field data-invalid={!!errors.classroomId}>
                  <FieldLabel htmlFor="classroomId">Classroom</FieldLabel>
                  <Select items={(classrooms ?? []).map((c) => ({ label: `${c.roomCode} - ${c.building}`, value: String(c.classroomId) }))} value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger id="classroomId"><SelectValue placeholder="Select classroom" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {(classrooms ?? []).map((c) => (
                          <SelectItem key={c.classroomId} value={String(c.classroomId)}>{c.roomCode} - {c.building}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FieldError errors={toError(errors.classroomId)} />
                </Field>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <Field data-invalid={!!errors.sectionName}>
                <FieldLabel htmlFor="sectionName">Section</FieldLabel>
                <Input id="sectionName" {...register("sectionName")} />
                <FieldError errors={toError(errors.sectionName)} />
              </Field>
              <Field data-invalid={!!errors.maxStudents}>
                <FieldLabel htmlFor="maxStudents">Max Students</FieldLabel>
                <Input id="maxStudents" type="number" {...register("maxStudents")} />
                <FieldError errors={toError(errors.maxStudents)} />
              </Field>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
