"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
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

type ExamResult = {
  result_id: number;
  exam_id: number;
  enrollment_id: number;
  score: number;
  student_name: string;
  exam_type: string;
  max_score: number;
};

export function MyGrades() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const dbId = (user?.publicMetadata?.db_id ?? 0) as number;

  useEffect(() => {
    if (!dbId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    fetch(`/api/exam-results?student_id=${dbId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) setResults(data);
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [dbId]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">My Grades</h1>
        <SkeletonTable rows={5} cols={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">My Grades</h1>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  const averagePct = results.length
    ? (results.reduce((sum, r) => sum + (r.score / r.max_score) * 100, 0) / results.length).toFixed(1)
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
              <TableHead>Exam Type</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Max Score</TableHead>
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((r) => {
              const pct = ((r.score / r.max_score) * 100).toFixed(1);
              return (
                <TableRow key={r.result_id}>
                  <TableCell className="font-medium capitalize">{r.exam_type}</TableCell>
                  <TableCell>{r.score}</TableCell>
                  <TableCell>{r.max_score}</TableCell>
                  <TableCell>
                    <Badge variant={Number(pct) >= 50 ? "default" : "destructive"}>
                      {pct}%
                    </Badge>
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
