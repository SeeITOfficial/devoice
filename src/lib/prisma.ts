import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Prisma 7 + PostgreSQL singleton.
 *
 * Prisma 7 requires an explicit driver adapter — PrismaPg is the direct
 * equivalent of PrismaBetterSqlite3, just for PostgreSQL.
 *
 * DATABASE_URL is read from the environment (set via prisma.config.ts and
 * Vercel's project settings in production).
 *
 * The global singleton prevents multiple pool connections being created
 * during Next.js hot-reload in development.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makePrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    // At build time or in environments without a DB, defer the error to
    // the first actual database call rather than crashing the module load.
    console.warn("[prisma] DATABASE_URL is not set — Prisma will not connect.");
  }
  const adapter = new PrismaPg({ connectionString: connectionString ?? "" });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? makePrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}