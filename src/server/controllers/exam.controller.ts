import { NextRequest, NextResponse } from "next/server";
import * as examService from "@/server/services/exam.service";
import { getAuthorizationContext } from "@/permissions";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status = message.includes("Forbidden") ? 403 : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function list(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "Exam");
    const { searchParams } = new URL(req.url);
    const filters = {
      offeringId: searchParams.get("offering_id") ? Number(searchParams.get("offering_id")) : undefined,
    };
    const exams = await examService.list(filters, authz.scope);
    return NextResponse.json(exams);
  } catch (error) {
    return errorResponse(error);
  }
}
