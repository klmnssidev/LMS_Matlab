"use client";

import { useUser } from "@clerk/nextjs";
import { BookOpen, Trophy, CalendarCheck, GraduationCap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SkeletonStatCards } from "@/components/loading-skeletons";
import { useMyStats } from "@/features/dashboard/hooks";

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number | string }) {
  return (
    <Card className="flex-row items-center p-4 border-l-[3px] border-l-accent">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
        <Icon className="size-5 text-accent" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{typeof value === "number" ? value.toLocaleString() : value}</p>
      </div>
    </Card>
  );
}

function attendanceBadge(status: string) {
  switch (status) {
    case "Present": return "default" as const;
    case "Late": return "secondary" as const;
    case "Excused": return "outline" as const;
    default: return "destructive" as const;
  }
}

export function StudentDashboard() {
  const { user } = useUser();
  const { data: stats, isLoading, error } = useMyStats();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.fullName || "Student"}</h1>
        <SkeletonStatCards count={4} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.fullName || "Student"}</h1>
        <p className="text-destructive">{error?.message ?? "Failed to load"}</p>
      </div>
    );
  }

  const { enrollments, upcomingExams, attendance } = stats as {
    enrollments: { total: number; active: number; completed: number };
    upcomingExams: { exam_id: number; exam_type: string; exam_date: string; course_name: string; course_code: string }[];
    attendance: { status: string; count: number }[];
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.fullName || "Student"}</h1>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Enrolled" value={enrollments.active} />
        <StatCard icon={GraduationCap} label="Completed" value={enrollments.completed} />
        <StatCard icon={Trophy} label="Total Courses" value={enrollments.total} />
        <StatCard icon={CalendarCheck} label="Upcoming Exams" value={upcomingExams.length} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {upcomingExams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Exams</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingExams.map((ex) => (
                    <TableRow key={ex.exam_id}>
                      <TableCell>
                        <span className="text-xs font-mono text-muted-foreground">{ex.course_code}</span>
                        {" "}
                        {ex.course_name}
                      </TableCell>
                      <TableCell className="capitalize">{ex.exam_type}</TableCell>
                      <TableCell>{ex.exam_date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {attendance.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendance.map((a) => (
                    <TableRow key={a.status}>
                      <TableCell>
                        <Badge variant={attendanceBadge(a.status)}>{a.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{a.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
