import { prisma } from "@/server/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { AuthorizationScope } from "@/permissions";
import { offeringInclude, buildOfferingWhere } from "@/server/repositories/helpers/course-offering-query.helper";
import type { OfferingFilters } from "@/server/repositories/helpers/course-offering-query.helper";

export type { OfferingFilters };

export async function findMany(filters: OfferingFilters = {}, scope?: AuthorizationScope) {
  return prisma.courseOffering.findMany({
    where: buildOfferingWhere(filters, scope),
    include: offeringInclude,
    orderBy: [{ course: { courseName: "asc" } }, { sectionName: "asc" }],
  });
}

export async function findById(id: number, scope?: AuthorizationScope) {
  return prisma.courseOffering.findFirst({
    where: { offeringId: id, ...buildOfferingWhere({}, scope) },
    include: offeringInclude,
  });
}

export async function create(data: Prisma.CourseOfferingCreateInput) {
  return prisma.courseOffering.create({ data });
}

export async function update(id: number, data: Prisma.CourseOfferingUpdateInput) {
  return prisma.courseOffering.update({ where: { offeringId: id }, data });
}

export async function remove(id: number) {
  return prisma.courseOffering.delete({ where: { offeringId: id } });
}

export async function count(filters: OfferingFilters = {}, scope?: AuthorizationScope) {
  return prisma.courseOffering.count({ where: buildOfferingWhere(filters, scope) });
}
