"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SkeletonTable } from "@/components/loading-skeletons";
import { useTeachers } from "@/features/teachers/hooks/use-teachers";
import { useDepartments } from "@/shared/hooks/use-departments";
import { Can } from "@/permissions/components/can";

export function TeacherList() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const { data: departments = [] } = useDepartments();

  const { data, isLoading, error } = useTeachers({
    search: search || undefined,
    department_id: deptFilter ? Number(deptFilter) : undefined,
  });

  const teachers = data?.data ?? [];

  const departmentItems = [
    { label: "All Departments", value: "" },
    ...departments.map((d) => ({
      label: d.departmentName,
      value: String(d.departmentId),
    })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>
        <Can I="create" a="Teacher">
          <Link href="/teachers/new" className={buttonVariants()}>
            <Plus data-icon="inline-start" />
            Add Teacher
          </Link>
        </Can>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          items={departmentItems}
          value={deptFilter}
          onValueChange={(v) => setDeptFilter(v ?? "")}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {departmentItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <SkeletonTable rows={5} cols={6} />}
      {error && <p className="text-destructive">{error.message}</p>}

      {!isLoading && !error && teachers.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Search /></EmptyMedia>
            <EmptyTitle>No teachers found</EmptyTitle>
            <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isLoading && !error && teachers.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((t) => (
              <TableRow key={t.teacherId}>
                <TableCell className="font-medium">{t.teacherName}</TableCell>
                <TableCell className="text-muted-foreground">{t.email}</TableCell>
                <TableCell>{t.departmentCode}</TableCell>
                <TableCell className="text-muted-foreground">{t.academicRank}</TableCell>
                <TableCell className="text-muted-foreground">{t.hireDate}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/teachers/${t.teacherId}`} className={buttonVariants({ variant: "link", size: "sm" })}>
                    View
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
