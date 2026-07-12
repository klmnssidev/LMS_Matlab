"use client";

import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { useCreateCourse, useUpdateCourse, useCourse } from "@/features/courses/hooks/use-courses";
import { useDepartments } from "@/shared/hooks/use-departments";

const formSchema = z.object({
  courseCode: z.string().min(1, "Code is required").max(20),
  courseName: z.string().min(1, "Name is required").max(150),
  creditHours: z.string().min(1, "Required").refine(
    (v) => {
      const n = Number(v);
      return !isNaN(n) && n >= 1 && n <= 6;
    },
    "Must be 1–6",
  ),
  departmentId: z.string().min(1, "Department is required"),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  initial?: { course_id?: number };
};

export function CourseForm({ initial }: Props) {
  const router = useRouter();
  const { data: departments = [] } = useDepartments();
  const { data: existing } = useCourse(initial?.course_id ?? null);
  const { mutateAsync: createCourse, isPending: isCreating } = useCreateCourse();
  const { mutateAsync: updateCourse, isPending: isUpdating } = useUpdateCourse();
  const isEditing = !!initial?.course_id;
  const isPending = isCreating || isUpdating;

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseCode: existing?.courseCode ?? "",
      courseName: existing?.courseName ?? "",
      creditHours: existing ? String(existing.creditHours) : "",
      departmentId: existing ? String(existing.departmentId) : "",
    },
    values: existing
      ? {
          courseCode: existing.courseCode,
          courseName: existing.courseName,
          creditHours: String(existing.creditHours),
          departmentId: String(existing.departmentId),
        }
      : undefined,
  });

  async function onSubmit(data: FormValues) {
    try {
      if (isEditing) {
        await updateCourse({
          course_id: initial!.course_id!,
          courseCode: data.courseCode,
          courseName: data.courseName,
          creditHours: Number(data.creditHours),
          departmentId: Number(data.departmentId),
        });
      } else {
        await createCourse({
          courseCode: data.courseCode,
          courseName: data.courseName,
          creditHours: Number(data.creditHours),
          departmentId: Number(data.departmentId),
        });
      }
      router.push("/courses");
      router.refresh();
    } catch {
      // error handled by mutation state
    }
  }

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {isEditing ? "Edit Course" : "Add Course"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <FieldGroup>
              <Field data-invalid={!!errors.courseName}>
                <FieldLabel htmlFor="courseName">Course Name</FieldLabel>
                <Input id="courseName" {...register("courseName")} aria-invalid={!!errors.courseName} />
                <FieldError errors={errors.courseName ? [{ message: errors.courseName.message }] : undefined} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!errors.courseCode}>
                  <FieldLabel htmlFor="courseCode">Course Code</FieldLabel>
                  <Input id="courseCode" {...register("courseCode")} aria-invalid={!!errors.courseCode} />
                  <FieldError errors={errors.courseCode ? [{ message: errors.courseCode.message }] : undefined} />
                </Field>
                <Field data-invalid={!!errors.creditHours}>
                  <FieldLabel htmlFor="creditHours">Credit Hours</FieldLabel>
                  <Input id="creditHours" type="number" min={1} max={6} {...register("creditHours")} aria-invalid={!!errors.creditHours} />
                  <FieldError errors={errors.creditHours ? [{ message: errors.creditHours.message }] : undefined} />
                </Field>
              </div>

              <Controller
                name="departmentId"
                control={control}
                render={({ field }) => {
                  const deptItems = [
                    { label: "Select department", value: "" },
                    ...departments.map((d) => ({
                      label: `${d.departmentName} (${d.departmentCode})`,
                      value: String(d.departmentId),
                    })),
                  ];
                  return (
                    <Field data-invalid={!!errors.departmentId}>
                      <FieldLabel htmlFor="departmentId">Department</FieldLabel>
                      <Select
                        items={deptItems}
                        value={field.value}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger id="departmentId">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {deptItems.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldError
                        errors={errors.departmentId ? [{ message: errors.departmentId.message }] : undefined}
                      />
                    </Field>
                  );
                }}
              />

              {isPending && <p className="text-sm text-muted-foreground">{isEditing ? "Updating course..." : "Creating course..."}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Course" : "Create Course"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </FieldGroup>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
