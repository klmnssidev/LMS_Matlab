import { prisma } from "@/server/lib/prisma";

export async function findAll() {
  return prisma.semester.findMany({
    orderBy: { semesterName: "desc" },
  });
}

export async function findById(id: number) {
  return prisma.semester.findUnique({ where: { semesterId: id } });
}
