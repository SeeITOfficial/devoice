import { NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { getServerConfig } from "@/lib/config";

/**
 * POST /api/ticket/request-code
 * Body: { phone: string }
 *
 * Looks up orders by phone. If any exist, generates a 6-digit OTP,
 * stores a hash of it, and emails it to the associated address(es).
 *
 * Always returns a generic success message to prevent phone number enumeration.
 */

const GENERIC_RESPONSE =
  "If tickets are associated with this number, a verification code has been sent to the registered email address.";

const OTP_EXPIRY_MINUTES = 10;
const RATE_LIMIT_WINDOW_MINUTES = 15;
const RATE_LIMIT_MAX_REQUESTS = 3;

function hashOtp(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}

function generateOtp(): string {
  // 6-digit cryptographically random OTP (000000–999999)
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export async function POST(request: Request) {
  try {
    const baseUrl = getServerConfig().baseUrl;
    const body = await request.json();
    const phone = (body.phone ?? "").trim();

    if (!phone) {
      return NextResponse.json(
        { success: true, message: GENERIC_RESPONSE },
        { status: 200 }
      );
    }

    // --- Rate limiting: max RATE_LIMIT_MAX_REQUESTS per phone per window ---
    const windowStart = new Date(
      Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000
    );

    const recentRequests = await prisma.ticketAccessCode.count({
      where: {
        phone,
        createdAt: { gte: windowStart },
      },
    });

    if (recentRequests >= RATE_LIMIT_MAX_REQUESTS) {
      // Still return generic — don't reveal rate limit info to enumeration
      return NextResponse.json(
        { success: true, message: GENERIC_RESPONSE },
        { status: 200 }
      );
    }

    // --- Look up confirmed or pending orders for this phone ---
    const orders = await prisma.ticketOrder.findMany({
      where: {
        phone,
        status: { in: ["PENDING", "CONFIRMED"] },
        email: { not: null },
      },
      select: { email: true },
      distinct: ["email"],
    });

    if (orders.length === 0) {
      // No orders — return generic response (do NOT reveal this)
      return NextResponse.json(
        { success: true, message: GENERIC_RESPONSE },
        { status: 200 }
      );
    }

    // --- Generate and store OTP ---
    const otp = generateOtp();
    const codeHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await prisma.ticketAccessCode.create({
      data: {
        phone,
        codeHash,
        expiresAt,
      },
    });

    // --- Send email to each unique address associated with this phone ---
    const uniqueEmails = [
      ...new Set(orders.map((o) => o.email).filter(Boolean) as string[]),
    ];

    for (const email of uniqueEmails) {
      await sendEmail({
        to: email,
        subject: "Your De Voice ticket access code",
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f2e9d8;color:#0d1a17;">
            <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#b18a3b;margin:0;">De Voice</p>
            <h1 style="font-size:36px;margin:12px 0 24px;font-weight:600;">Your verification code</h1>
            <div style="background:#0d1a17;border-radius:16px;padding:32px;text-align:center;">
              <p style="font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:#c9a24b;margin:0 0 12px;">One-time code</p>
              <p style="font-size:48px;font-weight:700;letter-spacing:0.15em;color:#f2e9d8;margin:0;font-family:monospace;">${otp}</p>
            </div>
            <p style="margin:24px 0 8px;font-size:14px;color:#0d1a17cc;">
              This code expires in <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
              Enter it at <a href="${baseUrl}/ticket" style="color:#b18a3b;">/ticket</a> to view your tickets.
            </p>
            <p style="font-size:12px;color:#0d1a1766;">If you did not request this code, you can safely ignore this email.</p>
          </div>
        `,
      });
    }

    return NextResponse.json(
      { success: true, message: GENERIC_RESPONSE },
      { status: 200 }
    );
  } catch (error) {
    console.error("[request-code] error:", error);
    // Still return generic to avoid leaking information
    return NextResponse.json(
      { success: true, message: GENERIC_RESPONSE },
      { status: 200 }
    );
  }
}
