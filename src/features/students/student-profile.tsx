"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar, BookOpen } from "lucide-react";
import type { StudentWithDept } from "./types";

type Enrollment = {
  enrollment_id: number;
  course_name: string;
  course_code: string;
  semester_name: string;
  status: string;
  final_grade: string | null;
};

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

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (error || !student) return <p className="text-destructive">{error || "Not found"}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/students" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">{student.student_name}</h1>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border bg-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {student.student_name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-lg">{student.student_name}</p>
                <p className="text-sm text-muted-foreground">{student.department_name}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{student.email}</span>
              </div>
              {student.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{student.phone}</span>
                </div>
              )}
              {student.date_of_birth && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
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
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                student.status === "Active" ? "bg-green-100 text-green-700" :
                student.status === "Graduated" ? "bg-blue-100 text-blue-700" :
                student.status === "Suspended" ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              }`}>
                {student.status}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Enrollments
            </h2>

            {enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No enrollments found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left px-3 py-2 font-medium">Course</th>
                      <th className="text-left px-3 py-2 font-medium">Semester</th>
                      <th className="text-left px-3 py-2 font-medium">Status</th>
                      <th className="text-left px-3 py-2 font-medium">Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e) => (
                      <tr key={e.enrollment_id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2">
                          <span className="font-medium">{e.course_code}</span> — {e.course_name}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{e.semester_name}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            e.status === "Active" ? "bg-green-100 text-green-700" :
                            e.status === "Completed" ? "bg-blue-100 text-blue-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 font-medium">{e.final_grade || "—"}</td>
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
