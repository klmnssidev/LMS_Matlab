import { NextResponse } from "next/server";
import { prisma } from "@/server/lib/prisma";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "No webhook secret" }, { status: 500 });
  }

  const text = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  let evt: { type: string; data: Record<string, unknown> };
  try {
    const { Webhook } = await import("svix");
    const wh = new Webhook(secret);
    evt = wh.verify(text, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof evt;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const { type, data } = evt;

  if (type === "user.created" || type === "user.updated") {
    const email = (data.email_addresses as Array<{ email_address: string }>)?.[0]?.email_address;
    const userId = data.id as string;

    if (!email) {
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    const [student, teacher] = await Promise.all([
      prisma.student.findFirst({ where: { email }, select: { studentId: true } }),
      prisma.teacher.findFirst({ where: { email }, select: { teacherId: true } }),
    ]);

    let role = "Student";
    let dbId: number | null = null;

    if (student) {
      role = "Student";
      dbId = student.studentId;
    } else if (teacher) {
      role = "Teacher";
      dbId = teacher.teacherId;
    }

    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { role, db_id: dbId },
    });
  }

  return NextResponse.json({ success: true });
}
