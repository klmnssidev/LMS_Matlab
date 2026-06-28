"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useEnrollments } from "@/features/enrollments/hooks/use-enrollments";

const statusItems = [
  { label: "All Status", value: "" },
  { label: "Active", value: "Active" },
  { label: "Completed", value: "Completed" },
  { label: "Dropped", value: "Dropped" },
];

function badgeVariant(status: string) {
  switch (status) {
    case "Active": return "default" as const;
    case "Completed": return "secondary" as const;
    case "Dropped": return "destructive" as const;
    default: return "outline" as const;
  }
}

export function EnrollmentList() {
  const [statusFilter, setStatusFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data, isLoading, error } = useEnrollments({ status: statusFilter || undefined });

  const enrollments = data?.data ?? [];
  const displayed = enrollments.slice(offset, offset + limit);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Enrollments</h1>
        <Button render={<Link href="/enrollments/new" />}>
          <Plus className="size-4" /> New Enrollment
        </Button>
      </div>

      <div className="flex gap-3">
        <Select
          items={statusItems}
          value={statusFilter}
          onValueChange={(v) => { setStatusFilter(v ?? ""); setOffset(0); }}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {statusItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <SkeletonTable rows={5} cols={7} />}
      {error && <p className="text-destructive">{error.message}</p>}

      {!isLoading && !error && displayed.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon" />
            <EmptyTitle>No enrollments found</EmptyTitle>
            <EmptyDescription>Try adjusting your filters.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isLoading && !error && displayed.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayed.map((e) => (
                <TableRow key={e.enrollmentId}>
                  <TableCell className="font-medium">{e.studentName}</TableCell>
                  <TableCell>
                    <span className="text-xs font-mono text-muted-foreground">{e.courseCode}</span>{" "}
                    {e.courseName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{e.sectionName}</TableCell>
                  <TableCell className="text-muted-foreground">{e.semesterName}</TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant(e.status)}>{e.status}</Badge>
                  </TableCell>
                  <TableCell>{e.finalGrade ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" size="sm" render={<Link href={`/students/${e.studentId}`} />}>
                      View Student
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {offset + 1}–{Math.min(offset + limit, enrollments.length)} of {enrollments.length}
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
                disabled={offset + limit >= enrollments.length}
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
