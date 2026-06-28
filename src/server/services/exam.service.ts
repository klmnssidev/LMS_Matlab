import { prisma } from "@/server/lib/prisma";

export async function list() {
  return prisma.exam.findMany({
    include: { offering: { include: { course: true } } },
    orderBy: { examDate: "desc" },
  });
}
