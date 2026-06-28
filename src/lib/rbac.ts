import { auth, currentUser } from "@clerk/nextjs/server";

export type Role = "Admin" | "Teacher" | "Student";

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function getUserRole(): Promise<Role | null> {
  const user = await currentUser();
  return (user?.publicMetadata?.role as Role) ?? null;
}

export async function getDbUserId(): Promise<number | null> {
  const user = await currentUser();
  return (user?.publicMetadata?.db_id as number) ?? null;
}

export async function requireRole(...roles: Role[]) {
  const session = await auth();
  if (!session.userId) {
    throw new ForbiddenError("Not authenticated");
  }
  const user = await currentUser();
  const role = (user?.publicMetadata?.role as Role) ?? null;
  if (!role || !roles.includes(role)) {
    throw new ForbiddenError(`Requires one of: ${roles.join(", ")} — your role: ${role ?? "none"}`);
  }
  return role;
}
