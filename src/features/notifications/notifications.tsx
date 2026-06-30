"use client";

import { Bell, Mail, MailOpen, Info, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
} from "@/features/notifications/hooks/use-notifications";

function typeIcon(type: string) {
  switch (type) {
    case "info": return Info;
    case "warning": return AlertCircle;
    case "success": return CheckCircle;
    default: return Bell;
  }
}

export function Notifications() {
  const { data: notifications = [], isLoading, error } = useNotifications();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <SkeletonTable rows={5} cols={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-destructive">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          {unreadCount > 0 && (
            <Badge variant="default">{unreadCount} unread</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <MailOpen className="size-4" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><Bell /></EmptyMedia>
            <EmptyTitle>No notifications</EmptyTitle>
            <EmptyDescription>You have no notifications at this time.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      <div className="flex flex-col gap-2">
        {notifications.map((n) => {
          const Icon = typeIcon(n.type);
          return (
            <Card
              key={n.notificationId}
              className={n.isRead ? "opacity-70" : "border-l-[3px] border-l-primary"}
            >
              <CardContent className="flex items-start gap-3 p-4">
                <div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  n.isRead ? "bg-muted" : "bg-primary/10"
                }`}>
                  <Icon className={`size-4 ${n.isRead ? "text-muted-foreground" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.isRead ? "text-muted-foreground" : "font-medium text-foreground"}`}>
                    {n.title}
                  </p>
                  {n.message && (
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    {new Date(n.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => markRead.mutate(n.notificationId)}
                    disabled={markRead.isPending}
                  >
                    <Mail className="size-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
