import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getServerConfig } from "@/lib/config";

/**
 * POST /api/ticket/verify-code
 * Body: { phone: string; code: string }
 *
 * Verifies the OTP submitted by the customer.
 * On success: sets a short-lived HTTP-only signed session cookie.
 * On failure: increments attempts counter; blocks after MAX_ATTEMPTS.
 *
 * Never returns ticket data — only a success/failure signal.
 */

const MAX_ATTEMPTS = 5;
const SESSION_MAX_AGE_SECONDS = 60 * 60; // 1 hour

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

function signSession(phone: string): string {
  const secret = getServerConfig().ticketSessionSecret;
  const payload = { phone, verifiedAt: Date.now() };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHash("sha256")
    .update(`${payloadB64}.${secret}`)
    .digest("hex");
  return `${payloadB64}.${sig}`;
}

export function verifySession(token: string): { phone: string } | null {
  try {
    const secret = getServerConfig().ticketSessionSecret;
    if (!secret) return null;

    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return null;

    const expectedSig = createHash("sha256")
      .update(`${payloadB64}.${secret}`)
      .digest("hex");

    if (sig !== expectedSig) return null;

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    ) as { phone: string; verifiedAt: number };

    const ageMs = Date.now() - payload.verifiedAt;
    if (ageMs > SESSION_MAX_AGE_SECONDS * 1000) return null;

    return { phone: payload.phone };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = (body.phone ?? "").trim();
    const code = (body.code ?? "").trim();

    if (!phone || !code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: "Invalid code format." },
        { status: 400 }
      );
    }

    // Find the most recent unexpired, unused code for this phone
    const accessCode = await prisma.ticketAccessCode.findFirst({
      where: {
        phone,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!accessCode) {
      return NextResponse.json(
        {
          success: false,
          message: "No valid code found. Please request a new one.",
        },
        { status: 400 }
      );
    }

    // Rate-limit verification attempts
    if (accessCode.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many incorrect attempts. Please request a new code.",
        },
        { status: 429 }
      );
    }

    const submittedHash = hashOtp(code);
    const isValid = submittedHash === accessCode.codeHash;

    if (!isValid) {
      // Increment attempts
      await prisma.ticketAccessCode.update({
        where: { id: accessCode.id },
        data: { attempts: accessCode.attempts + 1 },
      });

      const remaining = MAX_ATTEMPTS - (accessCode.attempts + 1);
      return NextResponse.json(
        {
          success: false,
          message:
            remaining > 0
              ? `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
              : "Too many incorrect attempts. Please request a new code.",
        },
        { status: 400 }
      );
    }

    // Valid — mark as used (one-time use)
    await prisma.ticketAccessCode.update({
      where: { id: accessCode.id },
      data: { usedAt: new Date() },
    });

    // Issue signed session cookie
    const token = signSession(phone);
    const cookieStore = await cookies();
    cookieStore.set("ticket_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[verify-code] error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
