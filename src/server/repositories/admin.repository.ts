import { prisma } from "@/server/lib/prisma";

export async function findMany() {
  return prisma.admin.findMany({
    orderBy: { adminName: "asc" },
  });
}

export async function findById(id: number) {
  return prisma.admin.findUnique({
    where: { adminId: id },
  });
}

export async function findByEmail(email: string) {
  return prisma.admin.findUnique({
    where: { email },
  });
}

export async function create(data: { adminName: string; email: string }) {
  return prisma.admin.create({ data });
}

export async function update(id: number, data: { adminName?: string; email?: string }) {
  return prisma.admin.update({ where: { adminId: id }, data });
}

export async function remove(id: number) {
  return prisma.admin.delete({ where: { adminId: id } });
}
