"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkeletonTable } from "@/components/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { useClassrooms } from "@/shared/hooks/use-classrooms";

export function ClassroomList() {
  const { data: classrooms, isLoading, error } = useClassrooms();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Classrooms</h1>
        <SkeletonTable rows={5} cols={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Classrooms</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Classrooms</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Building</TableHead>
                <TableHead>Capacity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(classrooms ?? []).map((c) => (
                <TableRow key={c.classroomId}>
                  <TableCell className="font-mono text-xs font-medium">{c.roomCode}</TableCell>
                  <TableCell>{c.building}</TableCell>
                  <TableCell><Badge variant="outline">{c.capacity} seats</Badge></TableCell>
                </TableRow>
              ))}
              {(!classrooms || classrooms.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">No classrooms found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
