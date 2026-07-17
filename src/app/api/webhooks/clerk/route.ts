import { NextResponse } from "next/server";
import { handleClerkWebhook } from "@/server/controllers/account.controller";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "No webhook secret" }, { status: 500 });
  }

  const text = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  let evt: { type: string; data: Record<string, unknown> };
  try {
    const { Webhook } = await import("svix");
    const wh = new Webhook(secret);
    evt = wh.verify(text, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as typeof evt;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  return handleClerkWebhook(evt);
}
