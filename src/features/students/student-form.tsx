"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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

type FormValues = {
  student_name: string;
  email: string;
  phone?: string;
  gender: "Male" | "Female";
  date_of_birth?: string;
  department_id: string;
  admission_year: string;
  status: "Active" | "Graduated" | "Suspended" | "Withdrawn";
};

type Department = { department_id: number; department_name: string; department_code: string };

export function StudentForm() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
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
    <div className="max-w-xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Add Student</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-xl border bg-card p-6">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            {...register("student_name")}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {errors.student_name && <p className="text-xs text-destructive mt-1">{errors.student_name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              {...register("phone")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              {...register("gender")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input
              {...register("date_of_birth")}
              type="date"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              {...register("department_id")}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.department_name} ({d.department_code})
                </option>
              ))}
            </select>
            {errors.department_id && <p className="text-xs text-destructive mt-1">{errors.department_id.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Admission Year</label>
            <input
              {...register("admission_year")}
              type="number"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.admission_year && <p className="text-xs text-destructive mt-1">{errors.admission_year.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            {...register("status")}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="Active">Active</option>
            <option value="Graduated">Graduated</option>
            <option value="Suspended">Suspended</option>
            <option value="Withdrawn">Withdrawn</option>
          </select>
        </div>

        {submitError && <p className="text-sm text-destructive">{submitError}</p>}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create Student"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
