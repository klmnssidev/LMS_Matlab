import { NextRequest } from "next/server";
import * as accountController from "@/server/controllers/account.controller";

export const POST = (req: NextRequest) => accountController.link(req);
