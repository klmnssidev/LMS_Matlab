import { prisma } from "@/server/lib/prisma";

export async function findAll() {
  return prisma.department.findMany({
    orderBy: { departmentName: "asc" },
  });
}

export async function findById(id: number) {
  return prisma.department.findUnique({ where: { departmentId: id } });
}
