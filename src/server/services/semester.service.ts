import { prisma } from "@/server/lib/prisma";

export async function list() {
  return prisma.semester.findMany({
    orderBy: { semesterName: "desc" },
  });
}
