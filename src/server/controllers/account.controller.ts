import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import * as accountLinkingService from "@/server/services/account-linking.service";

const LinkStudentSchema = z.object({
  studentNumber: z.string().min(1, "Student number is required"),
});

const LinkTeacherSchema = z.object({
  employeeNumber: z.string().min(1, "Employee number is required"),
});

export async function link(req: NextRequest) {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();

    let linkedUser: accountLinkingService.LinkedUser;

    if ("studentNumber" in body) {
      const parsed = LinkStudentSchema.parse(body);
      linkedUser = await accountLinkingService.linkStudent(session.userId, parsed.studentNumber);
    } else if ("employeeNumber" in body) {
      const parsed = LinkTeacherSchema.parse(body);
      linkedUser = await accountLinkingService.linkTeacher(session.userId, parsed.employeeNumber);
    } else {
      return NextResponse.json(
        { error: "Provide studentNumber or employeeNumber" },
        { status: 400 },
      );
    }

    const { clerkClient } = await import("@clerk/nextjs/server");
    const client = await clerkClient();
    const role = linkedUser.type === "student" ? "Student" : "Teacher";
    await client.users.updateUser(session.userId, {
      publicMetadata: { role },
    });

    const record = linkedUser.record as { studentId?: number; teacherId?: number };
    return NextResponse.json({
      success: true,
      type: linkedUser.type,
      id: linkedUser.type === "student" ? record.studentId : record.teacherId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }

    if (error instanceof accountLinkingService.AccountNotLinkedError ||
        error instanceof accountLinkingService.InvalidStudentNumberError ||
        error instanceof accountLinkingService.InvalidEmployeeNumberError ||
        error instanceof accountLinkingService.AccountAlreadyLinkedError) {
      return NextResponse.json({ error: error.code }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function me() {
  try {
    const session = await auth();
    if (!session.userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const linked = await accountLinkingService.getLinkedUser(session.userId);
    if (!linked) {
      return NextResponse.json({ error: "ACCOUNT_NOT_LINKED" }, { status: 401 });
    }

    if (linked.type === "student") {
      const { clerkUserId: _, ...profile } = linked.record;
      return NextResponse.json({ type: "student", ...profile });
    }

    const { clerkUserId: __, ...profile } = linked.record;
    return NextResponse.json({ type: "teacher", ...profile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
