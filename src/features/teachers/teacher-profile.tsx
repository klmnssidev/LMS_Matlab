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
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SkeletonProfile } from "@/components/loading-skeletons";
import type { TeacherWithDept } from "./types";

type CourseOffering = {
  offering_id: number;
  course_code: string;
  course_name: string;
  semester_name: string;
  room_code: string;
  section_name: string;
};

export function TeacherProfile({ id }: { id: number }) {
  const [teacher, setTeacher] = useState<TeacherWithDept | null>(null);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(async () => {
      if (!cancelled) setLoading(true);
      if (!cancelled) setError(null);

      try {
        const [teacherRes, offeringsRes] = await Promise.all([
          fetch(`/api/teachers?id=${id}`),
          fetch(`/api/course-offerings?teacher_id=${id}`),
        ]);
        if (!teacherRes.ok) throw new Error("Teacher not found");
        const teacherData = await teacherRes.json();
        if (!cancelled) setTeacher(teacherData);

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

  if (loading) return <SkeletonProfile />;
  if (error || !teacher) return <p className="text-destructive">{error || "Not found"}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/teachers" />}>
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{teacher.teacher_name}</h1>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {teacher.teacher_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-lg">{teacher.teacher_name}</p>
                  <p className="text-sm text-muted-foreground">{teacher.department_name}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4" />
                  <span>{teacher.email}</span>
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>Hired: {teacher.hire_date}</span>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-xs text-muted-foreground">Academic Rank</p>
                <p className="font-semibold">{teacher.academic_rank}</p>
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
                    <EmptyTitle>No course offerings</EmptyTitle>
                    <EmptyDescription>This teacher has no course offerings yet.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Room</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offerings.map((o) => (
                      <TableRow key={o.offering_id}>
                        <TableCell>
                          <span className="font-medium">{o.course_code}</span> — {o.course_name}
                        </TableCell>
                        <TableCell>{o.section_name}</TableCell>
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
