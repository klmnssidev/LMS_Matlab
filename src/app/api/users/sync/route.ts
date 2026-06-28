import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

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
      const studentResult = await db.query("SELECT student_id FROM students WHERE email = $1", [primaryEmail]);
      const teacherResult = await db.query("SELECT teacher_id FROM teachers WHERE email = $1", [primaryEmail]);

      let role = "Student";
      let dbId: number | null = null;

      if (studentResult.rows.length > 0) {
        role = "Student";
        dbId = studentResult.rows[0].student_id;
      } else if (teacherResult.rows.length > 0) {
        role = "Teacher";
        dbId = teacherResult.rows[0].teacher_id;
      }

      await client.users.updateUser(userId, {
        publicMetadata: { role, db_id: dbId },
      });
    }
  }

  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "http://localhost:3000"));
}
