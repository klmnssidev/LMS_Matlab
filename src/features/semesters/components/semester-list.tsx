"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkeletonTable } from "@/components/loading-skeletons";
import { useSemesters } from "@/shared/hooks/use-semesters";

export function SemesterList() {
  const { data: semesters, isLoading, error } = useSemesters();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Semesters</h1>
        <SkeletonTable rows={3} cols={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Semesters</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Semesters</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semester</TableHead>
                <TableHead>Academic Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(semesters ?? []).map((s) => (
                <TableRow key={s.semesterId}>
                  <TableCell className="font-medium">{s.semesterName}</TableCell>
                  <TableCell className="text-muted-foreground">{s.academicYear}</TableCell>
                </TableRow>
              ))}
              {(!semesters || semesters.length === 0) && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">No semesters found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
