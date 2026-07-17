import { prisma } from "@/server/lib/prisma";

export async function findAll() {
  return prisma.classroom.findMany({
    orderBy: { roomCode: "asc" },
  });
}

export async function findById(id: number) {
  return prisma.classroom.findUnique({ where: { classroomId: id } });
}
