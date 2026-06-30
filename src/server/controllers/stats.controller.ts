import { NextResponse } from "next/server";
import * as statsService from "@/server/services/stats.service";
import { getAuthorizationContext } from "@/permissions";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status = message.includes("Forbidden") ? 403 : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function getAdminDashboard() {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "Analytics");
    const stats = await statsService.getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getMyStats(request: Request) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "Dashboard");
    const url = new URL(request.url);
    const semesterId = url.searchParams.get("semesterId")
      ? Number(url.searchParams.get("semesterId"))
      : undefined;
    const stats = await statsService.getMyStats(authz.scope, semesterId);
    return NextResponse.json(stats);
  } catch (error) {
    return errorResponse(error);
  }
}
