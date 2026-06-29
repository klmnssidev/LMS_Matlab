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
import { useCreateTeacher, useUpdateTeacher, useTeacher } from "@/features/teachers/hooks/use-teachers";
import { useDepartments } from "@/shared/hooks/use-departments";

const formSchema = z.object({
  teacherName: z.string().min(1, "Name is required").max(120),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().max(30).optional().or(z.literal("")),
  departmentId: z.string().min(1, "Department is required"),
  academicRank: z.string().min(1, "Rank is required"),
  hireDate: z.string().min(1, "Hire date is required"),
});

type FormValues = z.infer<typeof formSchema>;

const rankItems = [
  { label: "Professor", value: "Professor" },
  { label: "Associate Professor", value: "Associate Professor" },
  { label: "Assistant Professor", value: "Assistant Professor" },
  { label: "Lecturer", value: "Lecturer" },
  { label: "Instructor", value: "Instructor" },
  { label: "Adjunct", value: "Adjunct" },
];

type Props = {
  initial?: { teacher_id?: number };
};

export function TeacherForm({ initial }: Props) {
  const router = useRouter();
  const { data: departments = [] } = useDepartments();
  const { data: existing } = useTeacher(initial?.teacher_id ?? null);
  const { mutateAsync: createTeacher, isPending: isCreating } = useCreateTeacher();
  const { mutateAsync: updateTeacher, isPending: isUpdating } = useUpdateTeacher();
  const isEditing = !!initial?.teacher_id;
  const isPending = isCreating || isUpdating;

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teacherName: existing?.teacherName ?? "",
      email: existing?.email ?? "",
      phone: existing?.phone ?? "",
      departmentId: existing ? String(existing.departmentId) : "",
      academicRank: existing?.academicRank ?? "",
      hireDate: existing?.hireDate ?? "",
    },
    values: existing
      ? {
          teacherName: existing.teacherName,
          email: existing.email,
          phone: existing.phone ?? "",
          departmentId: String(existing.departmentId),
          academicRank: existing.academicRank,
          hireDate: existing.hireDate,
        }
      : undefined,
  });

  async function onSubmit(data: FormValues) {
    try {
      if (isEditing) {
        await updateTeacher({
          teacher_id: initial!.teacher_id!,
          teacherName: data.teacherName,
          email: data.email,
          phone: data.phone || null,
          departmentId: Number(data.departmentId),
          academicRank: data.academicRank,
          hireDate: data.hireDate,
        });
      } else {
        await createTeacher({
          teacherName: data.teacherName,
          email: data.email,
          phone: data.phone || null,
          departmentId: Number(data.departmentId),
          academicRank: data.academicRank,
          hireDate: data.hireDate,
        });
      }
      router.push("/teachers");
      router.refresh();
    } catch {
      // error handled by mutation state
    }
  }

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {isEditing ? "Edit Teacher" : "Add Teacher"}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <FieldGroup>
              <Field data-invalid={!!errors.teacherName}>
                <FieldLabel htmlFor="teacherName">Full Name</FieldLabel>
                <Input id="teacherName" {...register("teacherName")} aria-invalid={!!errors.teacherName} />
                <FieldError errors={errors.teacherName ? [{ message: errors.teacherName.message }] : undefined} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field data-invalid={!!errors.email}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" type="email" {...register("email")} aria-invalid={!!errors.email} />
                  <FieldError errors={errors.email ? [{ message: errors.email.message }] : undefined} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input id="phone" {...register("phone")} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <Controller
                  name="academicRank"
                  control={control}
                  render={({ field }) => (
                    <Field data-invalid={!!errors.academicRank}>
                      <FieldLabel htmlFor="academicRank">Academic Rank</FieldLabel>
                      <Select
                        items={rankItems}
                        value={field.value}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger id="academicRank">
                          <SelectValue placeholder="Select rank" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {rankItems.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldError
                        errors={errors.academicRank ? [{ message: errors.academicRank.message }] : undefined}
                      />
                    </Field>
                  )}
                />
              </div>

              <Field data-invalid={!!errors.hireDate}>
                <FieldLabel htmlFor="hireDate">Hire Date</FieldLabel>
                <Input id="hireDate" type="date" {...register("hireDate")} aria-invalid={!!errors.hireDate} />
                <FieldError errors={errors.hireDate ? [{ message: errors.hireDate.message }] : undefined} />
              </Field>

              {isPending && <p className="text-sm text-muted-foreground">{isEditing ? "Updating teacher..." : "Creating teacher..."}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Teacher" : "Create Teacher"}
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
