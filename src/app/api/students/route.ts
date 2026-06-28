import { NextRequest } from "next/server";
import * as controller from "@/server/controllers/student.controller";

export const GET = (req: NextRequest) => controller.list(req);
export const POST = (req: NextRequest) => controller.create(req);
export const PUT = (req: NextRequest) => controller.update(req);
export const DELETE = (req: NextRequest) => controller.remove(req);
