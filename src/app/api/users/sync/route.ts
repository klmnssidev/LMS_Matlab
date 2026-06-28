import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/server/lib/prisma";

export async function GET() {
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "http://localhost:3000"));
  }

  const email = session.sessionClaims?.email as string | undefined;
  if (!email) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const primaryEmail = user.primaryEmailAddress?.emailAddress;

    if (primaryEmail) {
      const [student, teacher] = await Promise.all([
        prisma.student.findFirst({ where: { email: primaryEmail }, select: { studentId: true } }),
        prisma.teacher.findFirst({ where: { email: primaryEmail }, select: { teacherId: true } }),
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

      await client.users.updateUser(userId, {
        publicMetadata: { role, db_id: dbId },
      });
    }
  }

  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "http://localhost:3000"));
}
