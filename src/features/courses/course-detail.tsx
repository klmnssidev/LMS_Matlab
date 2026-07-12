"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { useCourse, useDeleteCourse } from "@/features/courses/hooks/use-courses";
import { Can } from "@/permissions/components/can";

export function CourseDetail({ id }: { id: number }) {
  const router = useRouter();
  const { data: course, isLoading, error } = useCourse(id);
  const { mutateAsync: deleteCourse, isPending: isDeleting, error: deleteError } = useDeleteCourse();

  if (isLoading) return <SkeletonProfile hasAvatar={false} />;
  if (error || !course) return <p className="text-destructive">{error?.message || "Not found"}</p>;

  const offerings = course.offerings ?? [];

  async function handleDelete() {
    try {
      await deleteCourse(id);
      router.push("/courses");
      router.refresh();
    } catch {
      // error surfaced via mutation state
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/courses" className={buttonVariants({ variant: "ghost", size: "icon" })} aria-label="Back to courses">
          <ArrowLeft />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{course.courseName}</h1>
          <p className="text-sm text-muted-foreground font-mono">{course.courseCode}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Can I="update" a="Course">
            <Link href={`/courses/${course.courseId}/edit`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Pencil data-icon="inline-start" />
              Edit
            </Link>
          </Can>
          <Can I="delete" a="Course">
            <Button variant="destructive" size="sm" disabled={isDeleting} onClick={handleDelete}>
              <Trash2 data-icon="inline-start" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </Can>
          {deleteError && (
            <p className="text-sm text-destructive">{deleteError.message}</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-lg font-bold text-primary">
                    {course.courseCode.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">{course.departmentName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Credit Hours</p>
                  <p className="font-semibold text-lg">{course.creditHours}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Offerings</p>
                  <p className="font-semibold text-lg">{offerings.length}</p>
                </div>
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
                    <EmptyTitle>No offerings available</EmptyTitle>
                    <EmptyDescription>This course has no scheduled offerings yet.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Teacher</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Room</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {offerings.map((o) => (
                      <TableRow key={o.offeringId}>
                        <TableCell className="font-medium">{o.sectionName}</TableCell>
                        <TableCell>{o.teacherName}</TableCell>
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
