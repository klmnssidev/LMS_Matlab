"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { TeacherWithDept } from "./types";

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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Teachers</h1>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Departments</option>
          <option value="1">Computer Science</option>
          <option value="2">Information Technology</option>
          <option value="3">Information Systems</option>
          <option value="4">Software Engineering</option>
          <option value="5">Cyber Security</option>
          <option value="6">Data Science & AI</option>
        </select>
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && teachers.length === 0 && (
        <p className="text-muted-foreground">No teachers found.</p>
      )}

      {!loading && !error && teachers.length > 0 && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Department</th>
                <th className="text-left px-4 py-3 font-medium">Rank</th>
                <th className="text-left px-4 py-3 font-medium">Hire Date</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.teacher_id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{t.teacher_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.email}</td>
                  <td className="px-4 py-3">{t.department_code}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.academic_rank}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.hire_date}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/teachers/${t.teacher_id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
