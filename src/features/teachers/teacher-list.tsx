"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
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
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SkeletonTable } from "@/components/loading-skeletons";
import type { TeacherWithDept } from "./types";

const departmentItems = [
  { label: "All Departments", value: "" },
  { label: "Computer Science", value: "1" },
  { label: "Information Technology", value: "2" },
  { label: "Information Systems", value: "3" },
  { label: "Software Engineering", value: "4" },
  { label: "Cyber Security", value: "5" },
  { label: "Data Science & AI", value: "6" },
];

export function TeacherList() {
  const [teachers, setTeachers] = useState<TeacherWithDept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (deptFilter) params.set("department_id", deptFilter);

      if (!cancelled) setLoading(true);
      if (!cancelled) setError(null);

      try {
        const res = await fetch(`/api/teachers?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) setTeachers(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [search, deptFilter]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>

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

      {loading && <SkeletonTable rows={5} cols={6} />}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && teachers.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Search /></EmptyMedia>
            <EmptyTitle>No teachers found</EmptyTitle>
            <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!loading && !error && teachers.length > 0 && (
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
              <TableRow key={t.teacher_id}>
                <TableCell className="font-medium">{t.teacher_name}</TableCell>
                <TableCell className="text-muted-foreground">{t.email}</TableCell>
                <TableCell>{t.department_code}</TableCell>
                <TableCell className="text-muted-foreground">{t.academic_rank}</TableCell>
                <TableCell className="text-muted-foreground">{t.hire_date}</TableCell>
                <TableCell className="text-right">
                  <Button variant="link" size="sm" render={<Link href={`/teachers/${t.teacher_id}`} />}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
