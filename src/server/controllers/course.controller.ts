import { NextRequest, NextResponse } from "next/server";
import * as courseService from "@/server/services/course.service";
import { CreateCourseSchema, UpdateCourseSchema } from "@/server/schemas/course.schema";
import { getAuthorizationContext, authorize } from "@/permissions";

function errorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status = message.includes("Forbidden") ? 403 : 500;
  return NextResponse.json({ error: message }, { status });
}

function zodErrorResponse(error: unknown) {
  return NextResponse.json(
    { error: "Validation failed", details: (error as { issues: unknown[] }).issues },
    { status: 400 },
  );
}

export async function list(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "Course");
    const { searchParams } = new URL(req.url);
    const filters = {
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined,
    };
    const [courses, total] = await Promise.all([
      courseService.list(filters, authz.scope),
      courseService.count(filters, authz.scope),
    ]);
    return NextResponse.json({ data: courses, total });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getById(req: NextRequest) {
  try {
    const authz = await getAuthorizationContext();
    authz.authorize("read", "Course");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const course = await courseService.getById(Number(id), authz.scope);
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(course);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function create(req: NextRequest) {
  try {
    await authorize("create", "Course");
    const body = await req.json();
    const parsed = CreateCourseSchema.parse(body);
    const course = await courseService.create(parsed);
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "issues" in error) return zodErrorResponse(error);
    return errorResponse(error);
  }
}

export async function update(req: NextRequest) {
  try {
    await authorize("update", "Course");
    const body = await req.json();
    const { course_id, ...data } = body;
    if (!course_id) return NextResponse.json({ error: "course_id required" }, { status: 400 });
    const parsed = UpdateCourseSchema.parse(data);
    const course = await courseService.update(course_id, parsed);
    if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(course);
  } catch (error) {
    if (error instanceof Error && "issues" in error) return zodErrorResponse(error);
    return errorResponse(error);
  }
}

export async function remove(req: NextRequest) {
  try {
    await authorize("delete", "Course");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await courseService.remove(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
