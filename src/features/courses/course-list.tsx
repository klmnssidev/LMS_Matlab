"use client";

import { useEffect, useState } from "react";
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
import type { CourseWithDept } from "./types";

export function CourseList() {
  const [courses, setCourses] = useState<CourseWithDept[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      if (!cancelled) setLoading(true);
      if (!cancelled) setError(null);

      try {
        const res = await fetch(`/api/courses?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!cancelled) setCourses(data);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [search]);

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

      {loading && <SkeletonCardGrid count={6} />}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && courses.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Search /></EmptyMedia>
            <EmptyTitle>No courses found</EmptyTitle>
            <EmptyDescription>Try a different search term.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!loading && !error && courses.length > 0 && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link key={c.course_id} href={`/courses/${c.course_id}`}>
              <Card className="group cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">{c.course_code}</p>
                      <p className="font-semibold leading-tight group-hover:text-primary transition-colors">
                        {c.course_name}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {c.credit_hours} cr
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.department_name}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
