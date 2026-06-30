"use client";

import { Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SkeletonCardGrid } from "@/components/loading-skeletons";
import { useAnnouncements } from "@/features/announcements/hooks/use-announcements";

export function Announcements() {
  const { data: announcements = [], isLoading, error } = useAnnouncements();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <SkeletonCardGrid count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>

      {announcements.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Megaphone /></EmptyMedia>
            <EmptyTitle>No announcements</EmptyTitle>
            <EmptyDescription>There are no announcements at this time.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className="flex flex-col gap-4">
        {announcements.map((a) => (
          <Card key={a.announcementId}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-lg">{a.title}</CardTitle>
                {a.departmentName && (
                  <Badge variant="secondary" className="shrink-0">{a.departmentName}</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(a.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
