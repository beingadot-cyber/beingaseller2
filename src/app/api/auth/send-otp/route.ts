import { NextResponse } from "next/server";
import { db } from "@/db";
import { otpTokens } from "@/db/schema";
import { ensureSchema } from "@/db/bootstrap";
import { sendOtpEmail } from "@/lib/mailer";

export const runtime = "nodejs";

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, message: "Valid email required." }, { status: 400 });
  }

  await ensureSchema();
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await db.insert(otpTokens).values({ email: email.toLowerCase(), otp, expiresAt });

  try {
    await sendOtpEmail(email, otp);
  } catch (err) {
    console.error("[send-otp] email failed:", err);
    // In dev without Gmail creds, we return the OTP directly
    if (!process.env.GMAIL_PASS) {
      return NextResponse.json({ ok: true, dev_otp: otp });
    }
    return NextResponse.json({ ok: false, message: "Could not send email. Try again." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
