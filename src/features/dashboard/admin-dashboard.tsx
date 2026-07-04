"use client";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  ClipboardList,
  TableProperties,
  CalendarCheck,
  Percent,
  Layers,
  UserPlus,
  FileSpreadsheet,
  Clock,
} from "lucide-react";
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
import { useAdminStats } from "@/features/dashboard/hooks";
import type { DashboardStats } from "@/server/services/stats.service";

const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--primary)"];

const ATTENDANCE_COLORS: Record<string, string> = {
  Present: "var(--chart-2)",
  Late: "var(--chart-3)",
  Absent: "var(--chart-5)",
  Excused: "var(--chart-4)",
};

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

export function AdminDashboard() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <SkeletonStatCards count={9} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-destructive">{error?.message ?? "Failed to load"}</p>
      </div>
    );
  }

  const s = stats as DashboardStats;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {s.activeSemester && (
          <Badge variant="secondary" className="text-sm">
            <Layers className="size-4 mr-1" />
            {s.activeSemester}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={Users} label="Total Students" value={s.totalStudents} />
        <StatCard icon={GraduationCap} label="Total Teachers" value={s.totalTeachers} />
        <StatCard icon={BookOpen} label="Total Courses" value={s.totalCourses} />
        <StatCard icon={TableProperties} label="Course Offerings" value={s.totalCourseOfferings} />
        <StatCard icon={ClipboardList} label="Active Enrollments" value={s.activeEnrollments} />
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Building2} label="Departments" value={s.totalDepartments} />
        <StatCard icon={CalendarCheck} label="Exams This Semester" value={s.examsThisSemester} />
        <StatCard icon={Percent} label="Attendance Rate" value={s.attendanceRate > 0 ? `${s.attendanceRate}%` : "—"} />
        <StatCard icon={Layers} label="Active Semester" value={s.activeSemester ?? "—"} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-t-[3px] border-t-accent/40">
          <CardHeader>
            <CardTitle>Students by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={s.studentsByDepartment}>
                <XAxis dataKey="department_name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrollments per Semester</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={s.enrollmentTrend}>
                <XAxis dataKey="semester_name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={s.attendanceOverview}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ payload }) => `${payload.status}: ${payload.count}`}
                >
                  {s.attendanceOverview.map((entry: { status: string }, i: number) => (
                    <Cell key={i} fill={ATTENDANCE_COLORS[entry.status] ?? CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={s.gradeDistribution}
                  dataKey="count"
                  nameKey="grade"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ payload }) => `${payload.grade}: ${payload.count}`}
                >
                  {s.gradeDistribution.map((_item: { grade: string; count: number }, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Enrollment Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={s.courseEnrollmentDistribution} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="course_name" tick={{ fontSize: 11 }} width={160} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {s.recentEnrollments.map((r) => (
                  <TableRow key={r.enrollment_id}>
                    <TableCell className="font-medium">{r.student_name}</TableCell>
                    <TableCell>{r.course_name}</TableCell>
                    <TableCell>{r.section_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{r.enrollment_date}</TableCell>
                  </TableRow>
                ))}
                {s.recentEnrollments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No recent enrollments.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently Created Exams</CardTitle>
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
                {s.recentlyCreatedExams.map((e) => (
                  <TableRow key={e.exam_id}>
                    <TableCell>
                      <span className="text-xs font-mono text-muted-foreground">{e.course_code}</span> {e.course_name}
                    </TableCell>
                    <TableCell className="capitalize">{e.exam_type}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{e.exam_date}</TableCell>
                  </TableRow>
                ))}
                {s.recentlyCreatedExams.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No exams created yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {s.latestAttendance.map((a) => (
                  <TableRow key={a.attendance_id}>
                    <TableCell className="font-medium">{a.student_name}</TableCell>
                    <TableCell>{a.course_name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{a.attendance_date}</TableCell>
                    <TableCell>
                      <Badge variant={a.status === "Present" ? "default" : a.status === "Late" ? "secondary" : "destructive"}>
                        {a.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {s.latestAttendance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No attendance records yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
