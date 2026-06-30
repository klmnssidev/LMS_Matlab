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

    return NextResponse.json({
      success: true,
      type: linkedUser.role.toLowerCase(),
      id: linkedUser.studentId ?? linkedUser.teacherId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }

    if (
      error instanceof accountLinkingService.AccountNotLinkedError ||
      error instanceof accountLinkingService.InvalidStudentNumberError ||
      error instanceof accountLinkingService.InvalidEmployeeNumberError ||
      error instanceof accountLinkingService.AccountAlreadyLinkedError ||
      error instanceof accountLinkingService.StudentAlreadyLinkedError ||
      error instanceof accountLinkingService.TeacherAlreadyLinkedError
    ) {
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

    return NextResponse.json(linked);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
