"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useStudents } from "@/features/students/hooks/use-students";
import { Can } from "@/permissions/components/can";

const statusItems = [
  { label: "All Status", value: "" },
  { label: "Active", value: "Active" },
  { label: "Graduated", value: "Graduated" },
  { label: "Suspended", value: "Suspended" },
  { label: "Withdrawn", value: "Withdrawn" },
];

function badgeVariant(status: string) {
  switch (status) {
    case "Active": return "default" as const;
    case "Graduated": return "secondary" as const;
    case "Suspended": return "outline" as const;
    default: return "destructive" as const;
  }
}

export function StudentList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const { data, isLoading, error } = useStudents({
    search: search || undefined,
    status: statusFilter || undefined,
    limit,
    offset,
  });

  const students = data?.data ?? [];
  const total = data?.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Students</h1>
        <Can I="create" a="Student">
          <Button render={<Link href="/students/new" />} nativeButton={false}>
            <Plus data-icon="inline-start" />
            Add Student
          </Button>
        </Can>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
            className="pl-8"
          />
        </div>
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

      {!isLoading && !error && students.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Search /></EmptyMedia>
            <EmptyTitle>No students found</EmptyTitle>
            <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isLoading && !error && students.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.studentId}>
                  <TableCell className="font-medium">{s.studentName}</TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  <TableCell>{s.departmentCode}</TableCell>
                  <TableCell>{s.gender}</TableCell>
                  <TableCell>{s.admissionYear}</TableCell>
                  <TableCell>
                    <Badge variant={badgeVariant(s.status)}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="link" size="sm" render={<Link href={`/students/${s.studentId}`} />} nativeButton={false}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {offset + 1}–{offset + students.length} of {total}
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
                disabled={offset + limit >= total}
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
