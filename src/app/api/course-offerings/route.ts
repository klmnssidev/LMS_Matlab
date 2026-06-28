import { NextRequest } from "next/server";
import { list } from "@/server/controllers/course-offering.controller";

export const GET = async (req: NextRequest) => list(req);
