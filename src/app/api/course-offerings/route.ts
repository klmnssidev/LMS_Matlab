import { NextRequest } from "next/server";
import { list, create, update, remove } from "@/server/controllers/course-offering.controller";

export const GET = async (req: NextRequest) => list(req);
export const POST = create;
export const PUT = update;
export const DELETE = remove;
