"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { BookOpen, Users, CalendarCheck, GraduationCap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SkeletonStatCards } from "@/components/loading-skeletons";

type Offering = {
  offering_id: number;
  course_code: string;
  course_name: string;
  section_name: string;
  semester_name: string;
  room_code: string;
  max_students: number;
};

type TeacherStats = {
  totalOfferings: number;
  totalStudents: number;
  upcomingExams: { exam_id: number; course_name: string; exam_date: string; exam_type: string }[];
  offerings: Offering[];
};

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <Card className="flex-row items-center p-4 border-l-[3px] border-l-accent">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
        <Icon className="size-5 text-accent" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      </div>
    </Card>
  );
}

export function TeacherDashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/my-stats")
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Request failed (${res.status})`);
        }
        return res.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.fullName || "Teacher"}</h1>
        <SkeletonStatCards count={3} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.fullName || "Teacher"}</h1>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.fullName || "Teacher"}</h1>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <StatCard icon={BookOpen} label="My Courses" value={stats.totalOfferings} />
        <StatCard icon={Users} label="Total Students" value={stats.totalStudents} />
        <StatCard icon={CalendarCheck} label="Upcoming Exams" value={stats.upcomingExams.length} />
      </div>

      <Card className="border-t-[3px] border-t-accent/40">
        <CardHeader>
          <CardTitle>My Course Offerings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Capacity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.offerings.map((o) => (
                <TableRow key={o.offering_id}>
                  <TableCell>
                    <span className="text-xs font-mono text-muted-foreground">{o.course_code}</span>{" "}
                    {o.course_name}
                  </TableCell>
                  <TableCell>{o.section_name}</TableCell>
                  <TableCell className="text-muted-foreground">{o.semester_name}</TableCell>
                  <TableCell className="text-muted-foreground">{o.room_code}</TableCell>
                  <TableCell>{o.max_students}</TableCell>
                </TableRow>
              ))}
              {stats.offerings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No course offerings assigned yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {stats.upcomingExams.length > 0 && (
        <Card className="border-t-[3px] border-t-accent/40">
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
                {stats.upcomingExams.map((ex) => (
                  <TableRow key={ex.exam_id}>
                    <TableCell>{ex.course_name}</TableCell>
                    <TableCell className="capitalize">{ex.exam_type}</TableCell>
                    <TableCell>{ex.exam_date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
