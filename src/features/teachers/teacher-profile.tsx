"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar, BookOpen } from "lucide-react";
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

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error || !teacher) return <p className="text-destructive">{error || "Not found"}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teachers" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{teacher.teacher_name}</h1>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {teacher.teacher_name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-lg">{teacher.teacher_name}</p>
                <p className="text-sm text-muted-foreground">{teacher.department_name}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{teacher.email}</span>
              </div>
              {teacher.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{teacher.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Hired: {teacher.hire_date}</span>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs text-muted-foreground">Academic Rank</p>
              <p className="font-semibold">{teacher.academic_rank}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Offerings
            </h2>

            {offerings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No course offerings found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left px-3 py-2 font-medium">Course</th>
                      <th className="text-left px-3 py-2 font-medium">Section</th>
                      <th className="text-left px-3 py-2 font-medium">Semester</th>
                      <th className="text-left px-3 py-2 font-medium">Room</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offerings.map((o) => (
                      <tr key={o.offering_id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2">
                          <span className="font-medium">{o.course_code}</span> — {o.course_name}
                        </td>
                        <td className="px-3 py-2">{o.section_name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{o.semester_name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{o.room_code}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
