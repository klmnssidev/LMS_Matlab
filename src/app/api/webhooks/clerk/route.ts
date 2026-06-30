import { NextResponse } from "next/server";
import { prisma } from "@/server/lib/prisma";
import * as userAccountRepo from "@/server/repositories/user-account.repository";

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

  if (type === "user.created") {
    const userId = data.id as string;
    const email = (data.email_addresses as Array<{ email_address: string }>)?.[0]?.email_address;

    if (!email) {
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    const existing = await userAccountRepo.findByClerkId(userId);
    if (existing) {
      return NextResponse.json({ success: true });
    }

    const linkedByEmail = await userAccountRepo.findByEmail(email);
    if (linkedByEmail) {
      return NextResponse.json({ success: true });
    }

    const student = await prisma.student.findFirst({
      where: { email },
      select: { studentId: true },
    });

    if (student) {
      const linked = await userAccountRepo.findByStudentId(student.studentId);
      if (!linked) {
        await userAccountRepo.create({
          clerkUserId: userId,
          email,
          role: "STUDENT",
          studentId: student.studentId,
        });
      }
      return NextResponse.json({ success: true });
    }

    const teacher = await prisma.teacher.findFirst({
      where: { email },
      select: { teacherId: true },
    });

    if (teacher) {
      const linked = await userAccountRepo.findByTeacherId(teacher.teacherId);
      if (!linked) {
        await userAccountRepo.create({
          clerkUserId: userId,
          email,
          role: "TEACHER",
          teacherId: teacher.teacherId,
        });
      }
      return NextResponse.json({ success: true });
    }

    const admin = await prisma.admin.findFirst({
      where: { email },
      select: { adminId: true },
    });

    if (admin) {
      const linked = await userAccountRepo.findByEmail(email);
      if (!linked) {
        await userAccountRepo.create({
          clerkUserId: userId,
          email,
          role: "ADMIN",
        });
      }
      return NextResponse.json({ success: true });
    }
  }

  return NextResponse.json({ success: true });
}
