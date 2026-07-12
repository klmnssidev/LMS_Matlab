"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, Calendar, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { SkeletonProfile } from "@/components/loading-skeletons";
import { Can } from "@/permissions/components/can";
import { useTeacher, useDeleteTeacher } from "@/features/teachers/hooks/use-teachers";

export function TeacherProfile({ id }: { id: number }) {
  const router = useRouter();
  const { data: teacher, isLoading, error } = useTeacher(id);
  const { mutateAsync: deleteTeacher, isPending: isDeleting } = useDeleteTeacher();

  if (isLoading) return <SkeletonProfile />;
  if (error || !teacher) return <p className="text-destructive">{error?.message || "Not found"}</p>;

  const offerings = teacher.courseOfferings ?? [];

  async function handleDelete() {
    if (confirm("Delete this teacher? This action cannot be undone.")) {
      await deleteTeacher(teacher!.teacherId);
      router.push("/teachers");
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/teachers" />} nativeButton={false}>
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{teacher.teacherName}</h1>
        <div className="ml-auto flex gap-2">
          <Can I="update" a="Teacher">
            <Button variant="outline" size="sm" render={<Link href={`/teachers/${teacher.teacherId}/edit`} />} nativeButton={false}>
              <Pencil data-icon="inline-start" />
              Edit
            </Button>
          </Can>
          <Can I="delete" a="Teacher">
            <Button variant="destructive" size="sm" disabled={isDeleting} onClick={handleDelete}>
              <Trash2 data-icon="inline-start" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </Can>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                  {teacher.teacherName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-lg">{teacher.teacherName}</p>
                  <p className="text-sm text-muted-foreground">{teacher.departmentName}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-4" />
                  <span>{teacher.email}</span>
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="size-4" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="size-4" />
                  <span>Hired: {teacher.hireDate}</span>
                </div>
              </div>

              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-xs text-muted-foreground">Academic Rank</p>
                <p className="font-semibold">{teacher.academicRank}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Offerings</CardTitle>
            </CardHeader>
            <CardContent>
              {offerings.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon" />
                    <EmptyTitle>No course offerings</EmptyTitle>
                    <EmptyDescription>This teacher has no course offerings yet.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Room</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offerings.map((o) => (
                      <TableRow key={o.offeringId}>
                        <TableCell>
                          <span className="font-medium">{o.courseCode}</span> — {o.courseName}
                        </TableCell>
                        <TableCell>{o.sectionName}</TableCell>
                        <TableCell className="text-muted-foreground">{o.semesterName}</TableCell>
                        <TableCell className="text-muted-foreground">{o.roomCode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
