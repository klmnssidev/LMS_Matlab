"use client";

import { BookMarked } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SkeletonCardGrid } from "@/components/loading-skeletons";
import { useMyCourses } from "@/features/courses/hooks/use-my-courses";

function badgeVariant(status: string) {
  switch (status) {
    case "Active": return "default" as const;
    case "Completed": return "secondary" as const;
    case "Dropped": return "destructive" as const;
    default: return "outline" as const;
  }
}

export function MyCourses() {
  const { data: enrollments = [], isLoading, error } = useMyCourses();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <SkeletonCardGrid count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>

      {enrollments.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><BookMarked /></EmptyMedia>
            <EmptyTitle>No courses yet</EmptyTitle>
            <EmptyDescription>You are not enrolled in any courses this semester.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((e) => (
          <Card key={e.enrollmentId} className="group transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-muted-foreground">{e.courseCode}</p>
                  <CardTitle className="text-base group-hover:text-primary transition-colors truncate">
                    {e.courseName}
                  </CardTitle>
                </div>
                <Badge variant={badgeVariant(e.status)}>{e.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <p>Section: {e.sectionName}</p>
              <p>Semester: {e.semesterName}</p>
              <p>Teacher: {e.teacherName}</p>
              <p>Credits: {e.creditHours}</p>
              <p>Department: {e.departmentName}</p>
              {e.finalGrade && <p>Grade: <span className="font-semibold text-foreground">{e.finalGrade}</span></p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
