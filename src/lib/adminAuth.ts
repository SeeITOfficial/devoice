import { createHash } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/** Cookie name for the admin session token. */
const COOKIE_NAME = "devoice_management";

/**
 * Hash a raw session token with SHA-256.
 * The raw token lives only in the cookie; the hash is what we store in the DB.
 */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Extract the raw session token from the Cookie header of an API request.
 * Returns null if the cookie is absent.
 */
function getRawTokenFromHeader(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Resolve a raw session token to the associated ManagementUser.
 * Returns null if the token is missing, unknown, or expired.
 * Never exposes the token hash or user credentials to callers.
 */
async function resolveSession(rawToken: string | null | undefined) {
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) {
    // Expired — clean it up silently; do not reveal expiry to caller
    await prisma.adminSession.delete({ where: { tokenHash } }).catch(() => {});
    return null;
  }

  return session.user;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Server-component session check (uses next/headers cookies()).
 * Returns the ManagementUser if authenticated, null otherwise.
 */
export async function getAdminSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(COOKIE_NAME)?.value ?? null;
  return resolveSession(rawToken);
}

/**
 * API-route session check (reads the raw Cookie header).
 * Returns true if the request carries a valid, non-expired admin session.
 */
export async function validateAdminApiRequest(
  request: Request
): Promise<boolean> {
  const rawToken = getRawTokenFromHeader(request);
  const user = await resolveSession(rawToken);
  return user !== null;
}
