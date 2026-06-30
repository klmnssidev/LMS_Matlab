"use client";

import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { SkeletonTable } from "@/components/loading-skeletons";
import { useSchedule, type ScheduleEntry } from "@/features/schedule/hooks/use-schedule";

const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

const DAY_SHORT: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

type TimeSlot = {
  label: string;
  start: string;
  end: string;
};

function parseTime(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getTimeSlots(entries: ScheduleEntry[]): TimeSlot[] {
  const slots = new Set<string>();
  entries.forEach((e) => {
    if (e.startTime && e.endTime) {
      slots.add(`${e.startTime}-${e.endTime}`);
    }
  });
  return Array.from(slots)
    .map((s) => {
      const [start, end] = s.split("-");
      return { label: `${start} - ${end}`, start, end };
    })
    .sort((a, b) => parseTime(a.start) - parseTime(b.start));
}

export function Schedule() {
  const { data: entries = [], isLoading, error } = useSchedule();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Weekly Schedule</h1>
        <SkeletonTable rows={5} cols={6} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Weekly Schedule</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  const withTime = entries.filter((e) => e.dayOfWeek && e.startTime);
  const noTime = entries.filter((e) => !e.dayOfWeek || !e.startTime);
  const timeSlots = getTimeSlots(withTime);
  const days = [1, 2, 3, 4, 5];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Weekly Schedule</h1>

      {entries.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Calendar /></EmptyMedia>
            <EmptyTitle>No schedule available</EmptyTitle>
            <EmptyDescription>Your class schedule will appear here once it is set up.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {withTime.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timetable</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <div
              className="grid min-w-[700px]"
              style={{
                gridTemplateColumns: `120px repeat(${days.length}, 1fr)`,
                gap: "1px",
              }}
            >
              <div className="sticky left-0 bg-muted p-2 text-xs font-medium text-muted-foreground" />
              {days.map((d) => (
                <div key={d} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">
                  {DAY_SHORT[d]}
                </div>
              ))}

              {timeSlots.map((slot) => (
                <>
                  <div key={slot.label} className="bg-muted/50 p-2 text-xs text-muted-foreground flex items-center">
                    {slot.label}
                  </div>
                  {days.map((day) => {
                    const entry = withTime.find(
                      (e) => e.dayOfWeek === day && e.startTime === slot.start
                    );
                    return (
                      <div
                        key={`${day}-${slot.start}`}
                        className="min-h-[80px] p-1.5 bg-card border border-border/50"
                      >
                        {entry && (
                          <div className="h-full rounded bg-primary/10 p-1.5 text-xs leading-tight">
                            <p className="font-semibold text-primary truncate">{entry.courseCode}</p>
                            <p className="text-muted-foreground truncate">{entry.courseName}</p>
                            <p className="text-muted-foreground">{entry.teacherName}</p>
                            <p className="text-muted-foreground">{entry.roomCode}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {noTime.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Courses Without Scheduled Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {noTime.map((e) => (
                <Badge key={e.offeringId} variant="outline">
                  {e.courseCode} - {e.sectionName}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
