import { NextResponse } from "next/server";
import { getAuthorizationContext } from "@/permissions";
import * as announcementService from "@/server/services/announcement.service";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status = message.includes("Forbidden") ? 403 : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function list() {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "Announcement");
    const announcements = await announcementService.list(authz.scope);
    return NextResponse.json(announcements);
  } catch (error) {
    return errorResponse(error);
  }
}
