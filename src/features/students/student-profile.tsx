"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SkeletonProfile } from "@/components/loading-skeletons";
import type { StudentWithDept } from "./types";

type Enrollment = {
  enrollment_id: number;
  course_name: string;
  course_code: string;
  semester_name: string;
  status: string;
  final_grade: string | null;
};

function badgeVariant(status: string) {
  switch (status) {
    case "Active": return "default" as const;
    case "Completed": return "secondary" as const;
    default: return "destructive" as const;
  }
}

export function StudentProfile({ id }: { id: number }) {
  const [student, setStudent] = useState<StudentWithDept | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/students?id=${id}`).then((r) => {
        if (!r.ok) throw new Error("Student not found");
        return r.json();
      }),
      fetch(`/api/enrollments?student_id=${id}`).then((r) => {
        if (!r.ok) return [];
        return r.json();
      }),
    ])
      .then(([studentData, enrollmentData]) => {
        setStudent(studentData);
        setEnrollments(enrollmentData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonProfile />;
  if (error || !student) return <p className="text-destructive">{error || "Not found"}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/students" />}>
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{student.student_name}</h1>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {student.student_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-lg">{student.student_name}</p>
                  <p className="text-sm text-muted-foreground">{student.department_name}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4" />
                  <span>{student.email}</span>
                </div>
                {student.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" />
                    <span>{student.phone}</span>
                  </div>
                )}
                {student.date_of_birth && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>{student.date_of_birth}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Gender</p>
                  <p className="font-semibold">{student.gender}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Year</p>
                  <p className="font-semibold">{student.admission_year}</p>
                </div>
              </div>

              <div className="flex justify-center">
                <Badge variant={badgeVariant(student.status)} className="px-3 py-1">
                  {student.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon" />
                    <EmptyTitle>No enrollments</EmptyTitle>
                    <EmptyDescription>This student has no enrollments yet.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Grade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((e) => (
                      <TableRow key={e.enrollment_id}>
                        <TableCell>
                          <span className="font-medium">{e.course_code}</span> — {e.course_name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{e.semester_name}</TableCell>
                        <TableCell>
                          <Badge variant={badgeVariant(e.status)}>{e.status}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">{e.final_grade || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
