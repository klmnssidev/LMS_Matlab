"use client";

import { useParams } from "next/navigation";
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
import { useStudent } from "@/features/students/hooks/use-students";

type Enrollment = {
  enrollmentId: number;
  courseName: string;
  courseCode: string;
  semesterName: string;
  status: string;
  finalGrade: string | null;
};

function badgeVariant(status: string) {
  switch (status) {
    case "Active": return "default" as const;
    case "Completed": return "secondary" as const;
    default: return "destructive" as const;
  }
}

export function StudentProfile({ id }: { id: number }) {
  const { data: student, isLoading, error } = useStudent(id);
  const params = useParams();

  if (isLoading) return <SkeletonProfile />;
  if (error || !student) return <p className="text-destructive">{error?.message || "Not found"}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/students" />}>
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{student.studentName}</h1>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {student.studentName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-lg">{student.studentName}</p>
                  <p className="text-sm text-muted-foreground">{student.departmentName}</p>
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
                {student.dateOfBirth && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-4" />
                    <span>{student.dateOfBirth}</span>
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
                  <p className="font-semibold">{student.admissionYear}</p>
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
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon" />
                  <EmptyTitle>No enrollments</EmptyTitle>
                  <EmptyDescription>This student has no enrollments yet.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
