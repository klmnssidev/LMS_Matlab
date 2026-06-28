"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap } from "lucide-react";
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

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error || !course) return <p className="text-destructive">{error || "Not found"}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.course_name}</h1>
          <p className="text-sm text-muted-foreground font-mono">{course.course_code}</p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
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
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Course Offerings
            </h2>

            {offerings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No offerings available.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left px-3 py-2 font-medium">Section</th>
                    <th className="text-left px-3 py-2 font-medium">Teacher</th>
                    <th className="text-left px-3 py-2 font-medium">Semester</th>
                    <th className="text-left px-3 py-2 font-medium">Room</th>
                  </tr>
                </thead>
                <tbody>
                  {offerings.map((o) => (
                    <tr key={o.offering_id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium">{o.section_name}</td>
                      <td className="px-3 py-2">{o.teacher_name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{o.semester_name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{o.room_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
