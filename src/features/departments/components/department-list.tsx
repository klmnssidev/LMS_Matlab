"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkeletonTable } from "@/components/loading-skeletons";
import { useDepartments } from "@/shared/hooks/use-departments";

export function DepartmentList() {
  const { data: departments, isLoading, error } = useDepartments();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
        <SkeletonTable rows={5} cols={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(departments ?? []).map((d) => (
                <TableRow key={d.departmentId}>
                  <TableCell className="font-mono text-xs font-medium">{d.departmentCode}</TableCell>
                  <TableCell>{d.departmentName}</TableCell>
                </TableRow>
              ))}
              {(!departments || departments.length === 0) && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">No departments found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
