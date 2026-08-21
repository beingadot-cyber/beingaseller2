import { NextResponse } from "next/server";
import {
  adminConfigured,
  checkPassword,
  sessionCookieName,
  sessionCookieValue,
} from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Admin login isn't set up yet. Add an ADMIN_PASSWORD environment variable in Vercel, then redeploy.",
      },
      { status: 503 }
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  if (!checkPassword(password)) {
    return NextResponse.json({ ok: false, message: "Wrong password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName(), sessionCookieValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
