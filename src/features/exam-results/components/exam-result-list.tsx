"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkeletonTable } from "@/components/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { useExamResults, useDeleteExamResult } from "@/features/exam-results/hooks/use-exam-results";
import { useExams } from "@/shared/hooks/use-exams";

export function ExamResultList() {
  const [selectedExamId, setSelectedExamId] = useState<number | undefined>();
  const { data: exams } = useExams();
  const { data, isLoading, error } = useExamResults({ exam_id: selectedExamId });
  const deleteExamResult = useDeleteExamResult();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
        </div>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  const results = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
        <Button render={<Link href="/exam-results/new" />}>
          <Plus className="size-4" /> New Result
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            items={[
              { label: "All Exams", value: "" },
              ...(exams ?? []).map((e) => ({
                label: `${e.offering.course.courseCode} - ${e.examType} (${e.examDate})`,
                value: String(e.examId),
              })),
            ]}
            value={selectedExamId ? String(selectedExamId) : ""}
            onValueChange={(v) => setSelectedExamId(v ? Number(v) : undefined)}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="All Exams" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {[{ label: "All Exams", value: "" }, ...(exams ?? []).map((e) => ({
                  label: `${e.offering.course.courseCode} - ${e.examType} (${e.examDate})`,
                  value: String(e.examId),
                }))].map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Exam Type</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Max Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((r) => {
                const pct = ((r.score / r.maxScore) * 100).toFixed(1);
                return (
                  <TableRow key={r.resultId}>
                    <TableCell className="font-medium">{r.studentName}</TableCell>
                    <TableCell className="capitalize">{r.examType}</TableCell>
                    <TableCell>{r.score}</TableCell>
                    <TableCell>{r.maxScore}</TableCell>
                    <TableCell>
                      <Badge variant={Number(pct) >= 50 ? "default" : "destructive"}>{pct}%</Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleteExamResult.isPending}
                        onClick={async () => {
                          if (confirm("Delete this result?")) {
                            await deleteExamResult.mutateAsync(r.resultId);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {results.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No exam results yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
