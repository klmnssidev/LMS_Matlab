"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkeletonTable } from "@/components/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { useOfferings, useDeleteOffering } from "@/features/course-offerings/hooks/use-course-offerings";
import { Can } from "@/permissions/components/can";

export function CourseOfferingList() {
  const { data, isLoading, error } = useOfferings();
  const deleteOffering = useDeleteOffering();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Course Offerings</h1>
        </div>
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Course Offerings</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  const offerings = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Course Offerings</h1>
        <Can I="create" a="CourseOffering">
          <Button render={<Link href="/course-offerings/new" />} nativeButton={false}>
            <Plus className="size-4" /> New Offering
          </Button>
        </Can>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offerings.map((o) => (
                <TableRow key={o.offeringId}>
                  <TableCell>
                    <span className="text-xs font-mono text-muted-foreground">{o.courseCode}</span>
                    {" "}
                    {o.courseName}
                  </TableCell>
                  <TableCell>{o.teacherName}</TableCell>
                  <TableCell>{o.sectionName}</TableCell>
                  <TableCell className="text-muted-foreground">{o.semesterName}</TableCell>
                  <TableCell className="text-muted-foreground">{o.roomCode}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{o.maxStudents}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Can I="update" a="CourseOffering">
                        <Button variant="outline" size="sm" render={<Link href={`/course-offerings/${o.offeringId}/edit`} />} nativeButton={false}>
                          Edit
                        </Button>
                      </Can>
                      <Can I="delete" a="CourseOffering">
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteOffering.isPending}
                          onClick={async () => {
                            if (confirm("Delete this offering?")) {
                              await deleteOffering.mutateAsync(o.offeringId);
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {offerings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No offerings yet.
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
