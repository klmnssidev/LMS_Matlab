"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
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
import type { EnrollmentJoined } from "@/features/enrollments/types";

function badgeVariant(status: string) {
  switch (status) {
    case "Active": return "default" as const;
    case "Completed": return "secondary" as const;
    case "Dropped": return "destructive" as const;
    default: return "outline" as const;
  }
}

export function MyCourses() {
  const [enrollments, setEnrollments] = useState<EnrollmentJoined[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const dbId = (user?.publicMetadata?.db_id ?? 0) as number;

  useEffect(() => {
    if (!dbId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/enrollments?student_id=${dbId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) setEnrollments(data);
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [dbId]);

  if (loading) {
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
        <p className="text-destructive">{error}</p>
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
          <Card key={e.enrollment_id} className="group transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-muted-foreground">{e.course_code}</p>
                  <CardTitle className="text-base group-hover:text-primary transition-colors">
                    {e.course_name}
                  </CardTitle>
                </div>
                <Badge variant={badgeVariant(e.status)}>{e.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
              <p>Section: {e.section_name}</p>
              <p>Semester: {e.semester_name}</p>
              {e.final_grade && <p>Grade: <span className="font-semibold text-foreground">{e.final_grade}</span></p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
