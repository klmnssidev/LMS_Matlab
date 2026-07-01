import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAuthorizationContext } from "@/permissions";
import * as transcriptService from "@/server/services/transcript.service";
import { TranscriptQuerySchema } from "@/server/schemas/transcript.schema";

function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
  }
  const message = error instanceof Error ? error.message : "Internal server error";
  const status = message.includes("Forbidden") ? 403 : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function getTranscript(request: Request) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "MyGrades");

    if (authz.scope.role !== "Student") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const query = TranscriptQuerySchema.parse(Object.fromEntries(url.searchParams));

    const transcript = await transcriptService.getTranscript(
      authz.scope.studentId,
      query.semesterId
    );

    return NextResponse.json(transcript);
  } catch (error) {
    return errorResponse(error);
  }
}
