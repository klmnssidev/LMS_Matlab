"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SkeletonCardGrid } from "@/components/loading-skeletons";
import { useCourses } from "@/features/courses/hooks/use-courses";

export function CourseList() {
  const [search, setSearch] = useState("");
  const { data, isLoading, error } = useCourses({ search: search || undefined });
  const courses = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Courses</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {isLoading && <SkeletonCardGrid count={6} />}
      {error && <p className="text-destructive">{error.message}</p>}

      {!isLoading && !error && courses.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Search /></EmptyMedia>
            <EmptyTitle>No courses found</EmptyTitle>
            <EmptyDescription>Try a different search term.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isLoading && !error && courses.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link key={c.courseId} href={`/courses/${c.courseId}`}>
              <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">{c.courseCode}</p>
                      <p className="font-semibold leading-tight group-hover:text-primary transition-colors">
                        {c.courseName}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {c.creditHours} cr
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.departmentName}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
