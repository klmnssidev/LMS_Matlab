import { NextResponse } from "next/server";
import { getAuthorizationContext } from "@/permissions";
import * as scheduleService from "@/server/services/schedule.service";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status = message.includes("Forbidden") ? 403 : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function getMySchedule() {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "MySchedule");
    const schedule = await scheduleService.getMySchedule(authz.scope);
    return NextResponse.json(schedule);
  } catch (error) {
    return errorResponse(error);
  }
}
