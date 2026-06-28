import { NextRequest } from "next/server";
import { list, getById, create, update, remove } from "@/server/controllers/exam-result.controller";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("id")) return getById(req);
  return list(req);
};

export const POST = create;
export const PATCH = update;
export const DELETE = remove;
