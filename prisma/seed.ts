import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

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
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });