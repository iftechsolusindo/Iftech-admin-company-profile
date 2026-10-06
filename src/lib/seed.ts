import "dotenv/config";

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString =
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL belum diatur"
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const username = "admin";
  const password = "admin123";

  const hashedPassword =
    await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: {
      username,
    },
    update: {
      password: hashedPassword,
    },
    create: {
      username,
      password: hashedPassword,
    },
  });

  console.log(
    `Admin user created/updated: ${user.username}`
  );
}

main()
  .catch((error) => {
    console.error(
      "Seeder error:",
      error
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });