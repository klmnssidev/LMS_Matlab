"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkeletonTable } from "@/components/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from "@/components/ui/select";
import { useExamList, useDeleteExam } from "@/features/exams/hooks/use-exams";
import { useOfferings } from "@/features/course-offerings/hooks/use-course-offerings";
import { Can } from "@/permissions/components/can";

export function ExamList() {
  const [selectedOfferingId, setSelectedOfferingId] = useState<number | undefined>();
  const { data: offeringsData } = useOfferings();
  const { data: exams, isLoading, error } = useExamList(selectedOfferingId ? { offering_id: selectedOfferingId } : undefined);
  const deleteExam = useDeleteExam();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        </div>
        <SkeletonTable rows={5} cols={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  const offerings = offeringsData?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        <Can I="create" a="Exam">
          <Button render={<Link href="/exams/new" />} nativeButton={false}>
            <Plus className="size-4" /> New Exam
          </Button>
        </Can>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Course Offering</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedOfferingId ? String(selectedOfferingId) : ""}
            onValueChange={(v) => setSelectedOfferingId(v ? Number(v) : undefined)}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="All Offerings" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="">All Offerings</SelectItem>
                {offerings.map((o) => (
                  <SelectItem key={o.offeringId} value={String(o.offeringId)}>
                    {o.courseCode} - {o.sectionName} ({o.semesterName})
                  </SelectItem>
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
                <TableHead>Course Code</TableHead>
                <TableHead>Exam Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Max Score</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(exams ?? []).map((exam) => (
                <TableRow key={exam.examId}>
                  <TableCell className="font-mono text-xs">{exam.offering.course.courseCode}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{exam.examType}</Badge>
                  </TableCell>
                  <TableCell>{exam.examDate}</TableCell>
                  <TableCell>{exam.maxScore}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Can I="update" a="Exam">
                        <Button
                          variant="ghost"
                          size="icon"
                           render={<Link href={`/exams/${exam.examId}/edit`} />}
                           nativeButton={false}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      </Can>
                      <Can I="delete" a="Exam">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deleteExam.isPending}
                          onClick={async () => {
                            if (confirm("Delete this exam?")) {
                              await deleteExam.mutateAsync(exam.examId);
                            }
                          }}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!exams || exams.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No exams yet.
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
