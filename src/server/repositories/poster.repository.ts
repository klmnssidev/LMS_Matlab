import { prisma } from "@/server/lib/prisma";

export async function findMany() {
  return prisma.poster.findMany({
    orderBy: { createdAt: "desc" },
    select: { posterId: true, title: true, createdAt: true },
  });
}

export async function findById(id: number) {
  return prisma.poster.findUnique({ where: { posterId: id } });
}

export async function create(title: string, imageData: Uint8Array) {
  return prisma.poster.create({
    data: { title, imageData: imageData as never },
    select: { posterId: true, title: true, createdAt: true },
  });
}

export async function remove(id: number) {
  return prisma.poster.delete({ where: { posterId: id } });
}
