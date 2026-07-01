"use client";

import { useState } from "react";
import { GraduationCap, BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectGroup,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTranscript } from "@/features/transcript/hooks/use-transcript";

export function Transcript() {
  const [selectedSemester, setSelectedSemester] = useState("all");
  const { data: transcript, isLoading, error } = useTranscript();

  const filteredSemesters = transcript?.semesters.filter(
    (s) => selectedSemester === "all" || s.semesterName === selectedSemester
  ) ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Academic Transcript</h1>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Academic Transcript</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  if (!transcript || transcript.semesters.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Academic Transcript</h1>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><GraduationCap /></EmptyMedia>
            <EmptyTitle>No transcript data</EmptyTitle>
            <EmptyDescription>Your academic record will appear here once you have enrollments.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const uniqueSemesterNames = [...new Set(transcript.semesters.map((s) => s.semesterName))];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Academic Transcript</h1>
        <Select
          value={selectedSemester}
          onValueChange={(val) => setSelectedSemester(val ?? "all")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Semesters</SelectItem>
              {uniqueSemesterNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{transcript.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{transcript.departmentName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Student Number</p>
              <p className="font-medium">{transcript.studentNumber ?? "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Semesters Completed</p>
              <p className="font-medium">{transcript.semesters.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Cumulative GPA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {transcript.cumulativeGpa !== null && transcript.cumulativeGpa !== undefined
                ? transcript.cumulativeGpa.toFixed(2)
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Completed Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{transcript.totalCompletedCredits}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Remaining Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-muted-foreground">—</p>
          </CardContent>
        </Card>
      </div>

      {filteredSemesters.map((semester) => (
        <Card key={semester.semesterName + semester.academicYear}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-4" />
                {semester.semesterName}
                <span className="text-sm font-normal text-muted-foreground">
                  ({semester.academicYear})
                </span>
              </CardTitle>
              <div className="flex items-center gap-4 text-sm">
                <div className="text-right">
                  <p className="text-muted-foreground">Semester GPA</p>
                  <p className="font-semibold">
                    {semester.gpa !== null ? semester.gpa.toFixed(2) : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground">Credits</p>
                  <p className="font-semibold">{semester.earnedCredits}/{semester.totalCredits}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Code</TableHead>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Grade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {semester.enrollments.map((e) => (
                  <TableRow key={e.enrollmentId}>
                    <TableCell className="font-mono text-xs">{e.courseCode}</TableCell>
                    <TableCell className="font-medium">{e.courseName}</TableCell>
                    <TableCell>{e.creditHours}</TableCell>
                    <TableCell>
                      <Badge variant={e.letterGrade === "F" ? "destructive" : "default"}>
                        {e.letterGrade ?? "—"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
