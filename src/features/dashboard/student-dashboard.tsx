"use client";

import { useState } from "react";
import { BookOpen, Trophy, CalendarCheck, GraduationCap, CheckCircle, Percent, Banknote, BookMarked } from "lucide-react";
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
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectValue,
} from "@/components/ui/select";
import { SkeletonStatCards } from "@/components/loading-skeletons";
import { useMyStats, useMe } from "@/features/dashboard/hooks";

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
  const [semesterId, setSemesterId] = useState<number | null>(null);
  const { data: profile } = useMe();
  const { data: stats, isLoading, error } = useMyStats(semesterId);
  const displayName = (profile as { studentName?: string } | undefined)?.studentName || "Student";

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {displayName}</h1>
        <SkeletonStatCards count={9} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {displayName}</h1>
        <p className="text-destructive">{error?.message ?? "Failed to load"}</p>
      </div>
    );
  }

  const {
    enrollments,
    upcomingExams,
    attendance,
    attendancePercentage,
    gpa,
    completedCredits,
    departmentName,
    currentSemester,
    recentGrades,
    semesters = [],
  } = stats as {
    enrollments: { total: number; active: number; completed: number };
    upcomingExams: { exam_id: number; exam_type: string; exam_date: string; course_name: string; course_code: string }[];
    attendance: { status: string; count: number }[];
    attendancePercentage: number;
    gpa: number | null;
    completedCredits: number;
    departmentName: string;
    currentSemester: string | null;
    recentGrades: { exam_type: string; course_name: string; score: number; max_score: number }[];
    semesters?: { semesterId: number; semesterName: string; academicYear: string }[];
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {displayName}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {currentSemester && (
            <Badge variant="secondary">{currentSemester}</Badge>
          )}
          <Badge variant="outline">{departmentName}</Badge>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={BookOpen} label="Enrolled Courses" value={enrollments.active} />
        <StatCard icon={GraduationCap} label="Completed" value={enrollments.completed} />
        <StatCard icon={Percent} label="Attendance" value={attendancePercentage > 0 ? `${attendancePercentage}%` : "—"} />
        <StatCard icon={Trophy} label="GPA" value={gpa !== null ? gpa.toFixed(2) : "—"} />
        <StatCard icon={CheckCircle} label="Completed Credits" value={completedCredits} />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Banknote} label="Department" value={departmentName} />
        <StatCard icon={BookMarked} label="Total Courses" value={enrollments.total} />
        {currentSemester && <StatCard icon={CalendarCheck} label="Current Semester" value={currentSemester} />}
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

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attendance Summary</CardTitle>
              {semesters.length > 1 && (
                <Select
                  value={semesterId ? String(semesterId) : "all"}
                  onValueChange={(val) => setSemesterId(val === "all" || val === null ? null : Number(val))}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {semesters.map((s) => (
                        <SelectItem key={s.semesterId} value={String(s.semesterId)}>
                          {s.semesterName} ({s.academicYear})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {attendance.length === 0 && (
              <p className="text-sm text-muted-foreground">No attendance records for this period.</p>
            )}
            {attendance.length > 0 && (
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
            )}
          </CardContent>
        </Card>

        {recentGrades && recentGrades.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentGrades.map((g, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{g.course_name}</TableCell>
                      <TableCell className="capitalize">{g.exam_type}</TableCell>
                      <TableCell>{g.score}/{g.max_score}</TableCell>
                      <TableCell>
                        <Badge variant={g.max_score > 0 && (g.score / g.max_score) >= 0.5 ? "default" : "destructive"}>
                          {g.max_score > 0 ? `${Math.round((g.score / g.max_score) * 100)}%` : "—"}
                        </Badge>
                      </TableCell>
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
