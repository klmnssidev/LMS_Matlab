import { NextRequest } from "next/server";
import * as controller from "@/server/controllers/transcript.controller";

export const GET = (req: NextRequest) => controller.getTranscript(req);
