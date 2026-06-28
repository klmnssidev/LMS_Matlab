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
import { useCreateStudent } from "@/features/students/hooks/use-students";
import { useDepartments } from "@/shared/hooks/use-departments";

const formSchema = z.object({
  studentName: z.string().min(1, "Name is required").max(120),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().max(30).optional().or(z.literal("")),
  gender: z.enum(["Male", "Female"]),
  dateOfBirth: z.string().optional().or(z.literal("")),
  departmentId: z.string().min(1, "Department is required"),
  admissionYear: z.string().min(1, "Admission year is required"),
  status: z.enum(["Active", "Graduated", "Suspended", "Withdrawn"]),
});

type FormValues = z.infer<typeof formSchema>;

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
  const { data: departments = [] } = useDepartments();
  const { mutateAsync: createStudent, isPending } = useCreateStudent();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { status: "Active", gender: "Male", admissionYear: String(new Date().getFullYear()) },
  });

  async function onSubmit(data: FormValues) {
    try {
      await createStudent({
        studentName: data.studentName,
        email: data.email,
        phone: data.phone || null,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth || null,
        departmentId: Number(data.departmentId),
        admissionYear: Number(data.admissionYear),
        status: data.status,
      });
      router.push("/students");
      router.refresh();
    } catch {
      // error handled by mutation state
    }
  }

  return (
    <div className="max-w-xl flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Add Student</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <FieldGroup>
              <Field data-invalid={!!errors.studentName}>
                <FieldLabel htmlFor="studentName">Full Name</FieldLabel>
                <Input id="studentName" {...register("studentName")} aria-invalid={!!errors.studentName} />
                <FieldError errors={errors.studentName ? [{ message: errors.studentName.message }] : undefined} />
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
                  <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
                  <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
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
                <Field data-invalid={!!errors.admissionYear}>
                  <FieldLabel htmlFor="admissionYear">Admission Year</FieldLabel>
                  <Input
                    id="admissionYear"
                    type="number"
                    {...register("admissionYear")}
                    aria-invalid={!!errors.admissionYear}
                  />
                  <FieldError
                    errors={errors.admissionYear ? [{ message: errors.admissionYear.message }] : undefined}
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

              {isPending && <p className="text-sm text-muted-foreground">Creating student...</p>}

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating..." : "Create Student"}
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
