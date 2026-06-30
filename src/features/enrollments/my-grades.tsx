"use client";

import { Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useExamResults } from "@/features/enrollments/hooks/use-exam-results";

function letterGrade(pct: number): string {
  if (pct >= 90) return "A";
  if (pct >= 80) return "B";
  if (pct >= 70) return "C";
  if (pct >= 60) return "D";
  return "F";
}

export function MyGrades() {
  const { data: results = [], isLoading, error } = useExamResults({ self: true });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">My Grades</h1>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">My Grades</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  const averagePct = results.length
    ? (results.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0) / results.length).toFixed(1)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">My Grades</h1>

      {results.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Trophy /></EmptyMedia>
            <EmptyTitle>No grades yet</EmptyTitle>
            <EmptyDescription>Your exam results will appear here once they are posted.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {averagePct && (
        <Card className="w-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Average</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averagePct}%</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Exam Type</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Max Score</TableHead>
              <TableHead>Percentage</TableHead>
              <TableHead>Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((r) => {
              const pct = ((r.score / r.maxScore) * 100).toFixed(1);
              const grade = letterGrade(Number(pct));
              return (
                <TableRow key={r.resultId}>
                  <TableCell className="font-medium">{r.courseName ?? "—"}</TableCell>
                  <TableCell className="capitalize">{r.examType}</TableCell>
                  <TableCell>{r.score}</TableCell>
                  <TableCell>{r.maxScore}</TableCell>
                  <TableCell>
                    <Badge variant={Number(pct) >= 50 ? "default" : "destructive"}>
                      {pct}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-lg">{grade}</span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
