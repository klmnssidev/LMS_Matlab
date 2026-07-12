"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup, Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkeletonTable } from "@/components/loading-skeletons";
import { useOfferings } from "@/features/course-offerings/hooks/use-course-offerings";
import { useEnrollments } from "@/features/enrollments/hooks/use-enrollments";
import { useCreateAttendance } from "@/features/attendance/hooks/use-attendance";
import { Badge } from "@/components/ui/badge";

const statusItems = [
  { label: "Present", value: "Present" },
  { label: "Absent", value: "Absent" },
  { label: "Late", value: "Late" },
  { label: "Excused", value: "Excused" },
];

const formSchema = z.object({
  offeringId: z.string().min(1, "Course offering is required"),
  attendanceDate: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof formSchema>;

function toError(field: { message?: string } | undefined) {
  return field ? [{ message: field.message }] : undefined;
}

export function BulkAttendanceForm() {
  const router = useRouter();
  const { data: offeringsData } = useOfferings();
  const [selectedOfferingId, setSelectedOfferingId] = useState<number | null>(null);
  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useEnrollments({ offering_id: selectedOfferingId ?? undefined });
  const createAttendance = useCreateAttendance();
  const [statusMap, setStatusMap] = useState<Record<number, string>>({});

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      offeringId: "",
      attendanceDate: new Date().toISOString().split("T")[0],
    },
  });

  const handleOfferingChange = (v: string | null) => {
    if (v) {
      setSelectedOfferingId(Number(v));
      setStatusMap({});
    }
  };

  const handleStatusChange = (enrollmentId: number, status: string) => {
    setStatusMap((prev) => ({ ...prev, [enrollmentId]: status }));
  };

  const onSubmit = async (values: FormValues) => {
    const enrollments = enrollmentsData?.data ?? [];
    const records = enrollments
      .filter((e) => statusMap[e.enrollmentId])
      .map((e) => ({
        enrollmentId: e.enrollmentId,
        attendanceDate: values.attendanceDate,
        status: statusMap[e.enrollmentId],
      }));

    await Promise.all(records.map((r) => createAttendance.mutateAsync(r)));
    router.push("/attendance");
    router.refresh();
  };

  const enrollments = enrollmentsData?.data ?? [];
  const anyMissing = enrollments.length > 0 && enrollments.some((e) => !statusMap[e.enrollmentId]);

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Bulk Attendance Entry</CardTitle>
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
                    items={(offeringsData?.data ?? []).map((o) => ({ label: `${o.courseCode} - ${o.courseName} (${o.sectionName})`, value: String(o.offeringId) }))}
                    value={field.value}
                    onValueChange={(v) => { if (v) { field.onChange(v); handleOfferingChange(v); } }}
                  >
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
            <Field data-invalid={!!errors.attendanceDate}>
              <FieldLabel htmlFor="attendanceDate">Date</FieldLabel>
              <Input id="attendanceDate" type="date" {...register("attendanceDate")} />
              <FieldError errors={toError(errors.attendanceDate)} />
            </Field>

            {enrollmentsLoading && <SkeletonTable rows={3} cols={3} />}

            {!enrollmentsLoading && selectedOfferingId && enrollments.length === 0 && (
              <p className="text-muted-foreground">No enrollments for this offering.</p>
            )}

            {!enrollmentsLoading && enrollments.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((e) => (
                      <TableRow key={e.enrollmentId}>
                        <TableCell className="font-medium">{e.studentName}</TableCell>
                        <TableCell>
                          <Select
                            items={statusItems}
                            value={statusMap[e.enrollmentId] ?? ""}
                            onValueChange={(v) => v && handleStatusChange(e.enrollmentId, v)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {statusItems.map((item) => (
                                  <SelectItem key={item.value} value={item.value}>
                                    <Badge variant={item.value === "Present" ? "default" : item.value === "Absent" ? "destructive" : item.value === "Late" ? "secondary" : "outline"}>
                                      {item.label}
                                    </Badge>
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createAttendance.isPending || anyMissing || enrollments.length === 0}>
                {createAttendance.isPending ? "Saving..." : `Save Attendance (${Object.keys(statusMap).length} records)`}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
