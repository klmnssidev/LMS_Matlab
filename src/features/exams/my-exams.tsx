"use client";

import { FileSpreadsheet } from "lucide-react";
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
import { useMyExams } from "@/features/exams/hooks/use-my-exams";

export function MyExams() {
  const { data: exams = [], isLoading, error } = useMyExams();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
        <SkeletonTable rows={5} cols={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  const now = new Date().toISOString().split("T")[0];
  const upcoming = exams.filter((e) => e.examDate >= now);
  const completed = exams.filter((e) => e.examDate < now);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">My Exams</h1>

      {exams.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><FileSpreadsheet /></EmptyMedia>
            <EmptyTitle>No exams scheduled</EmptyTitle>
            <EmptyDescription>Your exams will appear here once scheduled.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {upcoming.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Upcoming Exams</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Max Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcoming.map((e) => (
                <TableRow key={e.examId}>
                  <TableCell className="font-medium">
                    <span className="text-xs font-mono text-muted-foreground">{e.offering.course.courseCode}</span>
                    {" "}
                    {e.offering.course.courseName}
                  </TableCell>
                  <TableCell className="capitalize">{e.examType}</TableCell>
                  <TableCell>{e.examDate}</TableCell>
                  <TableCell>{Number(e.maxScore)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {completed.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Past Exams</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Max Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completed.map((e) => (
                <TableRow key={e.examId}>
                  <TableCell className="font-medium">
                    <span className="text-xs font-mono text-muted-foreground">{e.offering.course.courseCode}</span>
                    {" "}
                    {e.offering.course.courseName}
                  </TableCell>
                  <TableCell className="capitalize">{e.examType}</TableCell>
                  <TableCell>{e.examDate}</TableCell>
                  <TableCell>{Number(e.maxScore)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
