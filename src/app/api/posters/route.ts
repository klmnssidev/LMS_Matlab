import { NextRequest } from "next/server";
import * as controller from "@/server/controllers/poster.controller";

export const GET = (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("id")) return controller.getById(req);
  return controller.list();
};
export const POST = (req: NextRequest) => controller.create(req);
export const DELETE = (req: NextRequest) => controller.remove(req);
