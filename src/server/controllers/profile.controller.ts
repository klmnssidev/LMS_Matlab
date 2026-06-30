import { NextResponse } from "next/server";
import { getAuthorizationContext } from "@/permissions";
import * as profileService from "@/server/services/profile.service";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status = message.includes("Forbidden") ? 403 : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function getMyProfile() {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "MyProfile");

    if (authz.scope.role !== "Student") {
      return NextResponse.json({ error: "Only students can access their profile" }, { status: 403 });
    }

    const profile = await profileService.getMyProfile(authz.scope.studentId);
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    return NextResponse.json(profile);
  } catch (error) {
    return errorResponse(error);
  }
}
