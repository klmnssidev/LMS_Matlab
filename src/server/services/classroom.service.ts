import { prisma } from "@/server/lib/prisma";

export async function list() {
  return prisma.classroom.findMany({
    orderBy: { roomCode: "asc" },
  });
}
