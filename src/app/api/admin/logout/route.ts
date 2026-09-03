import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "devoice_management";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function POST(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie") ?? "";
    const match = cookieHeader.match(
      new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`)
    );
    const rawToken = match ? decodeURIComponent(match[1]) : null;

    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      // Invalidate the session in the database
      await prisma.adminSession.deleteMany({
        where: { tokenHash },
      });
    }

    const response = NextResponse.json({ success: true });
    
    // Clear the cookie
    response.cookies.set(COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error) {
    console.error("Admin logout error:", error);
    return NextResponse.json(
      { message: "Unable to sign out." },
      { status: 500 }
    );
  }
}
