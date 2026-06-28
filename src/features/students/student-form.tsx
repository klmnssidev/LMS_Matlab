"use client";

import { useEffect, useState } from "react";
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

const formSchema = z.object({
  student_name: z.string().min(1, "Name is required").max(120),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().max(30).optional().or(z.literal("")),
  gender: z.enum(["Male", "Female"]),
  date_of_birth: z.string().optional().or(z.literal("")),
  department_id: z.string().min(1, "Department is required"),
  admission_year: z.string().min(1, "Admission year is required"),
  status: z.enum(["Active", "Graduated", "Suspended", "Withdrawn"]),
});

type FormValues = z.infer<typeof formSchema>;

type Department = { department_id: number; department_name: string; department_code: string };

const genderItems = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];

const statusItems = [
  { label: "Active", value: "Active" },
  { label: "Graduated", value: "Graduated" },
  { label: "Suspended", value: "Suspended" },
  { label: "Withdrawn", value: "Withdrawn" },
];

export function StudentForm() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: "Active", gender: "Male", admission_year: String(new Date().getFullYear()) },
  });

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then(setDepartments)
      .catch(() => {});
  }, []);

  async function onSubmit(data: FormValues) {
    setSubmitError(null);
    try {
      const body = {
        student_name: data.student_name,
        email: data.email,
        phone: data.phone || null,
        gender: data.gender,
        date_of_birth: data.date_of_birth || null,
        department_id: Number(data.department_id),
        admission_year: Number(data.admission_year),
        status: data.status,
      };
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to create" }));
        throw new Error(err.error || "Failed to create");
      }
      router.push("/students");
      router.refresh();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Unknown error");
    }
  }

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Add Student</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <FieldGroup>
              <Field data-invalid={!!errors.student_name}>
                <FieldLabel htmlFor="student_name">Full Name</FieldLabel>
                <Input id="student_name" {...register("student_name")} aria-invalid={!!errors.student_name} />
                <FieldError errors={errors.student_name ? [{ message: errors.student_name.message }] : undefined} />
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
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel htmlFor="gender">Gender</FieldLabel>
                      <Select
                        items={genderItems}
                        value={field.value}
                        onValueChange={(v) => field.onChange(v)}
                      >
                        <SelectTrigger id="gender">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {genderItems.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />
                <Field>
                  <FieldLabel htmlFor="date_of_birth">Date of Birth</FieldLabel>
                  <Input id="date_of_birth" type="date" {...register("date_of_birth")} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="department_id"
                  control={control}
                  render={({ field }) => {
                    const deptItems = [
                      { label: "Select department", value: "" },
                      ...departments.map((d) => ({
                        label: `${d.department_name} (${d.department_code})`,
                        value: String(d.department_id),
                      })),
                    ];
                    return (
                      <Field data-invalid={!!errors.department_id}>
                        <FieldLabel htmlFor="department_id">Department</FieldLabel>
                        <Select
                          items={deptItems}
                          value={field.value}
                          onValueChange={(v) => field.onChange(v)}
                        >
                          <SelectTrigger id="department_id">
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
                          errors={errors.department_id ? [{ message: errors.department_id.message }] : undefined}
                        />
                      </Field>
                    );
                  }}
                />
                <Field data-invalid={!!errors.admission_year}>
                  <FieldLabel htmlFor="admission_year">Admission Year</FieldLabel>
                  <Input
                    id="admission_year"
                    type="number"
                    {...register("admission_year")}
                    aria-invalid={!!errors.admission_year}
                  />
                  <FieldError
                    errors={errors.admission_year ? [{ message: errors.admission_year.message }] : undefined}
                  />
                </Field>
              </div>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="status">Status</FieldLabel>
                    <Select
                      items={statusItems}
                      value={field.value}
                      onValueChange={(v) => field.onChange(v)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {statusItems.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />

              {submitError && <p className="text-sm text-destructive">{submitError}</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Student"}
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
