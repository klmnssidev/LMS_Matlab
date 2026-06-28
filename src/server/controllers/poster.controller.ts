import { NextRequest, NextResponse } from "next/server";
import * as posterService from "@/server/services/poster.service";
import { requireRole } from "@/server/permissions/student.ability";

export async function list(req: NextRequest) {
  try {
    await requireRole("Admin", "Teacher", "Student");
    const posters = await posterService.list();
    return NextResponse.json(posters);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function getById(req: NextRequest) {
  try {
    await requireRole("Admin", "Teacher", "Student");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const poster = await posterService.getById(Number(id));
    if (!poster) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const buffer = poster.imageData as Buffer;
    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": "image/png" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function create(req: NextRequest) {
  try {
    await requireRole("Admin");
    const formData = await req.formData();
    const title = formData.get("title") as string | null;
    const file = formData.get("image") as File | null;

    if (!title || !file) {
      return NextResponse.json({ error: "title and image required" }, { status: 400 });
    }

    const buffer = new Uint8Array(await file.arrayBuffer());
    const poster = await posterService.create(title, buffer);
    return NextResponse.json(poster, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function remove(req: NextRequest) {
  try {
    await requireRole("Admin");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await posterService.remove(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Forbidden") ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
