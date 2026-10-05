import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "@prisma/client";

import { scryptSync, randomBytes } from "crypto";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");

  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

async function main() {
  await prisma.artistProfile.upsert({
    where: {
      id: "artist-profile",
    },
    update: {},
    create: {
      id: "artist-profile",
      name: "Kigula Jonathan Sedrak",
      tagline: "De Voice · Da Diva",
      bio: `Kigula Jonathan Sedrak is a Ugandan soul singer known for his remarkable vocal range, melismatic singing style and signature use of the high register.

His musical journey began in church, where he served as a choir leader. He later explored Acapella before pursuing a solo career.

His music draws from soul, R&B, pop, blues, jazz and gospel, with a strong emphasis on vocal expression and high-register performance.

On 3 June 2026, he officially released his debut album, De Voice My Soul.`,
    },
  });

  console.log("Artist profile seeded.");

  await prisma.bookingService.upsert({
    where: {
      id: "live-performance",
    },
    update: {},
    create: {
      id: "live-performance",
      name: "Live Performance",
      active: true,
      sortOrder: 1,
    },
  });

  console.log("Booking service seeded.");

  await prisma.managementUser.upsert({
    where: {
      email: "management@jonathankigula.com",
    },
    update: {},
    create: {
      email: "management@jonathankigula.com",
      passwordHash: hashPassword("DeVoice@2026"),
    },
  });

  console.log("Management user seeded.");
}



main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });