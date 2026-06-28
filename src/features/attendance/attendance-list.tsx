"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SkeletonTable } from "@/components/loading-skeletons";
import type { AttendanceJoined } from "./types";

function badgeVariant(status: string) {
  switch (status) {
    case "Present": return "default" as const;
    case "Late": return "secondary" as const;
    case "Excused": return "outline" as const;
    case "Absent": return "destructive" as const;
    default: return "outline" as const;
  }
}

export function AttendanceList() {
  const [records, setRecords] = useState<AttendanceJoined[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(async () => {
      const params = new URLSearchParams();
      if (startDate) params.set("start_date", startDate);
      if (endDate) params.set("end_date", endDate);

      if (!cancelled) setLoading(true);
      if (!cancelled) setError(null);
      try {
        const res = await fetch(`/api/attendance?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) setRecords(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [startDate, endDate, offset]);

  const displayed = records.slice(offset, offset + limit);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">From</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setOffset(0); }}
            className="w-44"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground">To</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setOffset(0); }}
            className="w-44"
          />
        </div>
      </div>

      {loading && <SkeletonTable rows={5} cols={6} />}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && displayed.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" />
            <EmptyTitle>No attendance records found</EmptyTitle>
            <EmptyDescription>Try adjusting your date filters.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!loading && !error && displayed.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map((r) => (
                <TableRow key={r.attendance_id}>
                  <TableCell className="font-medium">{r.student_name}</TableCell>
                  <TableCell className="text-muted-foreground">{r.course_name}</TableCell>
                  <TableCell>{r.attendance_date}</TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant(r.status)}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{r.remarks ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {offset + 1}–{Math.min(offset + limit, records.length)} of {records.length}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
              >
                <ChevronLeft data-icon="inline-start" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= records.length}
              >
                Next
                <ChevronRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
