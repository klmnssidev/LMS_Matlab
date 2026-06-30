"use client";

import { CalendarCheck } from "lucide-react";
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
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SkeletonTable } from "@/components/loading-skeletons";
import { useMyAttendance } from "@/features/attendance/hooks/use-my-attendance";

function badgeVariant(status: string) {
  switch (status) {
    case "Present": return "default" as const;
    case "Late": return "secondary" as const;
    case "Excused": return "outline" as const;
    case "Absent": return "destructive" as const;
    default: return "outline" as const;
  }
}

export function MyAttendance() {
  const { data: records = [], isLoading, error } = useMyAttendance();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        <SkeletonTable rows={5} cols={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  const presentCount = records.filter((r) => r.status === "Present" || r.status === "Late").length;
  const percentage = records.length > 0 ? Math.round((presentCount / records.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        {records.length > 0 && (
          <Badge variant={percentage >= 75 ? "default" : "destructive"} className="text-sm px-3 py-1">
            {percentage}% attendance
          </Badge>
        )}
      </div>

      {records.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><CalendarCheck /></EmptyMedia>
            <EmptyTitle>No attendance records</EmptyTitle>
            <EmptyDescription>Your attendance will appear here once recorded.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {records.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.attendanceId}>
                <TableCell className="font-medium">{r.courseName}</TableCell>
                <TableCell>{r.attendanceDate}</TableCell>
                <TableCell>
                  <Badge variant={badgeVariant(r.status)}>{r.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{r.remarks ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
