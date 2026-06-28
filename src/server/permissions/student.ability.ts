import { auth, currentUser } from "@clerk/nextjs/server";

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireRole(...roles: string[]) {
  const session = await auth();
  if (!session.userId) {
    throw new ForbiddenError("Not authenticated");
  }
  const user = await currentUser();
  const role = (user?.publicMetadata?.role as string) ?? null;
  if (!role || !roles.includes(role)) {
    throw new ForbiddenError(`Requires one of: ${roles.join(", ")} — your role: ${role ?? "none"}`);
  }
  return role;
}
