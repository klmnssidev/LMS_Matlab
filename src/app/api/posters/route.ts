import { NextRequest, NextResponse } from "next/server";
import { listPosters, getPoster, createPoster, deletePoster } from "@/services/posters";
import { ForbiddenError, requireRole } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (id) {
      const poster = await getPoster(Number(id));
      if (!poster) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return new NextResponse(poster.image_data, {
        headers: { "Content-Type": "image/png" },
      });
    }
    const posters = await listPosters();
    return NextResponse.json(posters);
  } catch (error) {
    const status = error instanceof ForbiddenError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("Admin");
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const file = formData.get("image") as File;

    if (!title || !file) {
      return NextResponse.json({ error: "title and image required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const poster = await createPoster({ title, image_data: buffer });
    return NextResponse.json(poster, { status: 201 });
  } catch (error) {
    const status = error instanceof ForbiddenError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireRole("Admin");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const ok = await deletePoster(Number(id));
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof ForbiddenError ? error.status : 500;
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status });
  }
}
