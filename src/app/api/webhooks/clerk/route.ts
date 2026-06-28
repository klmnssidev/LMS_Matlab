import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const studentResult = await db.query("SELECT student_id FROM students WHERE email = $1", [email]);
    const teacherResult = await db.query("SELECT teacher_id FROM teachers WHERE email = $1", [email]);

    let role = "Student";
    let dbId: number | null = null;

    if (studentResult.rows.length > 0) {
      role = "Student";
      dbId = studentResult.rows[0].student_id;
    } else if (teacherResult.rows.length > 0) {
      role = "Teacher";
      dbId = teacherResult.rows[0].teacher_id;
    }

    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: { role, db_id: dbId },
    });
  }

  return NextResponse.json({ success: true });
}
