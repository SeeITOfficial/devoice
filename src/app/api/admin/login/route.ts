import { NextResponse } from "next/server";
import { randomBytes, scryptSync, timingSafeEqual, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

/** Cookie name for the admin session. */
const COOKIE_NAME = "devoice_management";

/** Session lifetime: 7 days in seconds. */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function verifyPassword(password: string, storedPassword: string): boolean {
  const [salt, storedHash] = storedPassword.split(":");
  if (!salt || !storedHash) return false;
  const hash = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(storedHash, "hex")
  );
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        { message: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.managementUser.findUnique({
      where: { email: body.email.toLowerCase() },
    });

    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      return NextResponse.json(
        { message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Generate a cryptographically secure random session token (32 bytes = 64 hex chars).
    // The raw token goes into the cookie; only its SHA-256 hash is stored in the database.
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

    await prisma.adminSession.create({
      data: {
        tokenHash,
        expiresAt,
        managementUserId: user.id,
      },
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set(COOKIE_NAME, rawToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { message: "Unable to sign in." },
      { status: 500 }
    );
  }
}