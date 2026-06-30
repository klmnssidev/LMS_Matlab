import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getAuthorizationContext } from "@/permissions/authorization.service";
import { ForbiddenError } from "@/permissions/errors";
import type { Action } from "@/permissions/actions";
import type { Subject } from "@/permissions/subjects";
import type { AuthorizationContext } from "@/permissions/authorization.service";

export async function authorize(
  action: Action,
  subject: Subject
): Promise<AuthorizationContext> {
  const authz = await getAuthorizationContext();
  return authz.authorize(action, subject);
}

export async function authorizePage(
  action: Action,
  subject: Subject
): Promise<void> {
  const session = await auth();
  if (!session.userId) {
    redirect("/sign-in");
  }

  try {
    await authorize(action, subject);
  } catch (error) {
    if (error instanceof ForbiddenError) {
      redirect("/");
    }
    throw error;
  }
}

export function getErrorResponse(error: unknown) {
  if (error instanceof ForbiddenError) {
    return { error: error.code, status: error.status };
  }

  const message = error instanceof Error ? error.message : "Internal server error";
  return { error: message, status: 500 };
}
