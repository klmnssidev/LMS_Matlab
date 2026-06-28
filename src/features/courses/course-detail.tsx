"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SkeletonProfile } from "@/components/loading-skeletons";
import type { CourseWithDept } from "./types";

type Offering = {
  offering_id: number;
  teacher_name: string;
  semester_name: string;
  section_name: string;
  room_code: string;
};

export function CourseDetail({ id }: { id: number }) {
  const [course, setCourse] = useState<CourseWithDept | null>(null);
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(async () => {
      if (!cancelled) setLoading(true);
      if (!cancelled) setError(null);

      try {
        const [courseRes, offeringsRes] = await Promise.all([
          fetch(`/api/courses?id=${id}`),
          fetch(`/api/course-offerings?course_id=${id}`),
        ]);
        if (!courseRes.ok) throw new Error("Course not found");
        const courseData = await courseRes.json();
        if (!cancelled) setCourse(courseData);

        if (offeringsRes.ok) {
          const offeringsData = await offeringsRes.json();
          if (!cancelled) setOfferings(offeringsData);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <SkeletonProfile hasAvatar={false} />;
  if (error || !course) return <p className="text-destructive">{error || "Not found"}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/courses" />}>
          <ArrowLeft />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.course_name}</h1>
          <p className="text-sm text-muted-foreground font-mono">{course.course_code}</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-lg font-bold text-primary">
                    {course.course_code.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{course.department_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Credit Hours</p>
                  <p className="font-semibold text-lg">{course.credit_hours}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Offerings</p>
                  <p className="font-semibold text-lg">{offerings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Offerings</CardTitle>
            </CardHeader>
            <CardContent>
              {offerings.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon" />
                    <EmptyTitle>No offerings available</EmptyTitle>
                    <EmptyDescription>This course has no scheduled offerings yet.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Room</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offerings.map((o) => (
                      <TableRow key={o.offering_id}>
                        <TableCell className="font-medium">{o.section_name}</TableCell>
                        <TableCell>{o.teacher_name}</TableCell>
                        <TableCell className="text-muted-foreground">{o.semester_name}</TableCell>
                        <TableCell className="text-muted-foreground">{o.room_code}</TableCell>
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
