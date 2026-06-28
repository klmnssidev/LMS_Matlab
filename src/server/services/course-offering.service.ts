import { prisma } from "@/server/lib/prisma";

export async function listByTeacher(teacherId: number) {
  return prisma.courseOffering.findMany({
    where: { teacherId },
    include: {
      course: true,
      semester: true,
      classroom: true,
    },
    orderBy: { offeringId: "desc" },
  });
}
