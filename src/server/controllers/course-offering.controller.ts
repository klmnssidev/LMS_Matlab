import { NextRequest, NextResponse } from "next/server";
import * as offeringService from "@/server/services/course-offering.service";
import { CreateCourseOfferingSchema } from "@/server/schemas/course-offering.schema";
import { getAuthorizationContext, authorize } from "@/permissions";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status = message.includes("Forbidden") ? 403 : 500;
  return NextResponse.json({ error: message }, { status });
}

export async function list(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "CourseOffering");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const offering = await offeringService.getById(Number(id), authz.scope);
      if (!offering) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json(offering);
    }
    const filter: Record<string, number | undefined> = {
      teacherId: searchParams.get("teacher_id") ? Number(searchParams.get("teacher_id")) : undefined,
      semesterId: searchParams.get("semester_id") ? Number(searchParams.get("semester_id")) : undefined,
      courseId: searchParams.get("course_id") ? Number(searchParams.get("course_id")) : undefined,
    };
    const offerings = await offeringService.list(filter, authz.scope);
    return NextResponse.json({ data: offerings, total: offerings.length });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function create(req: NextRequest) {
  try {
    await authorize("create", "CourseOffering");
    const body = await req.json();
    const parsed = CreateCourseOfferingSchema.parse(body);
    const result = await offeringService.create(parsed);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { issues: unknown[] }).issues },
        { status: 400 },
      );
    }
    return errorResponse(error);
  }
}

export async function update(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("update", "CourseOffering");
    const body = await req.json();
    const { offering_id, ...data } = body;
    if (!offering_id) return NextResponse.json({ error: "offering_id required" }, { status: 400 });

    const result = await offeringService.update(offering_id, data, authz.scope);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && "issues" in error) {
      return NextResponse.json(
        { error: "Validation failed", details: (error as { issues: unknown[] }).issues },
        { status: 400 },
      );
    }
    return errorResponse(error);
  }
}

export async function remove(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("delete", "CourseOffering");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const result = await offeringService.remove(Number(id), authz.scope);
    if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
