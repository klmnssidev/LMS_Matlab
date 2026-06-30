import { NextRequest, NextResponse } from "next/server";
import { getAuthorizationContext } from "@/permissions";
import * as notificationService from "@/server/services/notification.service";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status = message.includes("Forbidden") ? 403 : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function list() {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "MyNotifications");
    const notifications = await notificationService.list(authz.scope);
    return NextResponse.json(notifications);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getUnreadCount() {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "MyNotifications");
    const count = await notificationService.getUnreadCount(authz.scope);
    return NextResponse.json({ count });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function markRead(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "MyNotifications");

    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    if (all) {
      await notificationService.markAllAsRead(authz.scope.accountId);
    } else {
      const id = searchParams.get("id");
      if (!id) return NextResponse.json({ error: "id or all=true required" }, { status: 400 });
      await notificationService.markAsRead(Number(id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
