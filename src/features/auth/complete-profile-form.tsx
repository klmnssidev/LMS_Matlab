"use client";

import { useState } from "react";
import { useForm, Controller, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const formSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("student"), studentNumber: z.string().min(1, "Student number is required") }),
  z.object({ type: z.literal("teacher"), employeeNumber: z.string().min(1, "Employee number is required") }),
]);

type FormValues = z.infer<typeof formSchema>;

const typeItems = [
  { label: "Student", value: "student" },
  { label: "Teacher", value: "teacher" },
];

export function CompleteProfileForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { type: "student", studentNumber: "" },
  });

  const userType = watch("type");

  async function onSubmit(data: FormValues) {
    setError(null);
    setIsPending(true);

    try {
      const body = data.type === "student"
        ? { studentNumber: data.studentNumber }
        : { employeeNumber: data.employeeNumber };

      const res = await fetch("/api/account/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        const messages: Record<string, string> = {
          ACCOUNT_NOT_LINKED: "This account is not linked to any profile.",
          INVALID_STUDENT_NUMBER: "No student found with this number.",
          INVALID_EMPLOYEE_NUMBER: "No teacher found with this number.",
          ACCOUNT_ALREADY_LINKED: "This account is already linked to a profile.",
          UNAUTHORIZED: "You must be signed in.",
        };
        setError(messages[json.error] ?? json.error ?? "Something went wrong");
        return;
      }

      window.location.href = "/";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>University Account Registration</CardTitle>
        <CardDescription>
          Please enter your university credentials to complete registration.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="type">Account Type</FieldLabel>
                  <Select
                    items={typeItems}
                    value={field.value}
                    onValueChange={(v) => field.onChange(v)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {typeItems.map((item) => (
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

            {userType === "student" && (
              <Field data-invalid={!!(errors as FieldErrors<Extract<FormValues, { type: "student" }>>).studentNumber}>
                <FieldLabel htmlFor="studentNumber">Student Number</FieldLabel>
                <Input
                  id="studentNumber"
                  placeholder="e.g. 20240015"
                  {...register("studentNumber")}
                  aria-invalid={!!(errors as FieldErrors<Extract<FormValues, { type: "student" }>>).studentNumber}
                />
                <FieldError
                  errors={(errors as FieldErrors<Extract<FormValues, { type: "student" }>>).studentNumber ? [{ message: (errors as FieldErrors<Extract<FormValues, { type: "student" }>>).studentNumber!.message }] : undefined}
                />
              </Field>
            )}

            {userType === "teacher" && (
              <Field data-invalid={!!(errors as FieldErrors<Extract<FormValues, { type: "teacher" }>>).employeeNumber}>
                <FieldLabel htmlFor="employeeNumber">Employee Number</FieldLabel>
                <Input
                  id="employeeNumber"
                  placeholder="e.g. EMP0015"
                  {...register("employeeNumber")}
                  aria-invalid={!!(errors as FieldErrors<Extract<FormValues, { type: "teacher" }>>).employeeNumber}
                />
                <FieldError
                  errors={(errors as FieldErrors<Extract<FormValues, { type: "teacher" }>>).employeeNumber ? [{ message: (errors as FieldErrors<Extract<FormValues, { type: "teacher" }>>).employeeNumber!.message }] : undefined}
                />
              </Field>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Registering..." : "Register Account"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
