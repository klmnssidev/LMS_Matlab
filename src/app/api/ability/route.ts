import { NextResponse } from "next/server";
import { getAuthorizationContext, ForbiddenError, AccountNotLinkedError } from "@/permissions";

export async function GET() {
  try {
    const authz = await getAuthorizationContext();
    return NextResponse.json({
      rules: authz.ability.rules,
      role: authz.account.role,
    });
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    if (error instanceof AccountNotLinkedError) {
      return NextResponse.json({ error: "ACCOUNT_NOT_LINKED" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
