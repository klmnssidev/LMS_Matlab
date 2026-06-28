import { auth } from "@clerk/nextjs/server";

export type Role = "Admin" | "Teacher" | "Student";

interface SessionClaims {
  metadata?: {
    role?: Role;
    db_id?: number;
  };
}

export async function getUserRole(): Promise<Role | null> {
  const session = await auth();
  const claims = session.sessionClaims as SessionClaims | null;
  return claims?.metadata?.role ?? null;
}

export async function getDbUserId(): Promise<number | null> {
  const session = await auth();
  const claims = session.sessionClaims as SessionClaims | null;
  return claims?.metadata?.db_id ?? null;
}

export async function requireRole(...roles: Role[]) {
  const role = await getUserRole();
  if (!role || !roles.includes(role)) {
    throw new Error("Forbidden");
  }
  return role;
}
