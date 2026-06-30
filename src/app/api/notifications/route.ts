import { NextRequest } from "next/server";
import { list, getUnreadCount, markRead } from "@/server/controllers/notification.controller";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("unread") === "true") {
    return getUnreadCount();
  }
  return list();
};

export const PATCH = markRead;
