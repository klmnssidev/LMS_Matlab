import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "students" });
}

export async function POST() {
  return NextResponse.json({ message: "created" }, { status: 201 });
}
