import { prisma } from "@/server/lib/prisma";
import type { Role } from "@prisma/client";

export async function findByClerkId(clerkUserId: string) {
  return prisma.userAccount.findUnique({
    where: { clerkUserId },
    include: { student: true, teacher: true },
  });
}

export async function findByStudentId(studentId: number) {
  return prisma.userAccount.findUnique({
    where: { studentId },
  });
}

export async function findByTeacherId(teacherId: number) {
  return prisma.userAccount.findUnique({
    where: { teacherId },
  });
}

export async function findByEmail(email: string) {
  return prisma.userAccount.findUnique({
    where: { email },
    include: { student: true, teacher: true },
  });
}

export async function create(data: {
  clerkUserId?: string;
  email: string;
  role: Role;
  studentId?: number;
  teacherId?: number;
}) {
  return prisma.userAccount.create({
    data,
    include: { student: true, teacher: true },
  });
}

export async function updateClerkUserId(id: number, clerkUserId: string) {
  return prisma.userAccount.update({
    where: { id },
    data: { clerkUserId },
  });
}
