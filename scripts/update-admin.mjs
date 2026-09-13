/**
 * Run with:
 *   node scripts/update-admin.mjs NEW_EMAIL NEW_PASSWORD
 *
 * Example:
 *   node scripts/update-admin.mjs jonathan@example.com MyNewPassword123
 */

import { randomBytes, scryptSync } from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

// Load DATABASE_URL from .env manually (no dotenv dependency needed)
import { readFileSync } from "fs";
const envFile = readFileSync(".env", "utf-8");
const dbUrlMatch = envFile.match(/DATABASE_URL\s*=\s*"?([^"\n]+)"?/);
if (!dbUrlMatch) {
  console.error("❌  DATABASE_URL not found in .env");
  process.exit(1);
}
const DATABASE_URL = dbUrlMatch[1].trim();

const [, , newEmail, newPassword] = process.argv;

if (!newEmail || !newPassword) {
  console.error("Usage: node scripts/update-admin.mjs <email> <password>");
  process.exit(1);
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

// Dynamic import of pg to avoid ESM issues
const { default: pg } = await import("pg");
const pool = new pg.Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

try {
  const existing = await prisma.managementUser.findFirst();
  if (!existing) {
    console.error("❌  No admin user found in database. Create one first.");
    process.exit(1);
  }

  const passwordHash = hashPassword(newPassword);

  await prisma.managementUser.update({
    where: { id: existing.id },
    data: {
      email: newEmail.toLowerCase().trim(),
      passwordHash,
    },
  });

  // Invalidate all existing sessions so old credentials can't be used
  await prisma.adminSession.deleteMany({ where: { managementUserId: existing.id } });

  console.log("✅  Admin credentials updated successfully.");
  console.log(`   Email:    ${newEmail.toLowerCase().trim()}`);
  console.log(`   Password: ${"*".repeat(newPassword.length)}`);
  console.log("   All existing sessions have been invalidated.");
} catch (err) {
  console.error("❌  Error:", err.message);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
