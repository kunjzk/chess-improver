import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE,
  expectedSessionToken,
  passwordConfigured,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!passwordConfigured()) {
    return NextResponse.json({ ok: true });
  }

  const body = (await request.json()) as { password?: string };
  const expected = process.env.APP_PASSWORD;
  if (!body.password || body.password !== expected) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const token = await expectedSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token ?? "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}
