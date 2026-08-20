import bcrypt from "bcrypt";
import { prisma } from "./db.js";

async function main() {
  const passwordHash = await bcrypt.hash("test-password", 10);

  const user = await prisma.user.upsert({
    where: {
      email: "psycholog@test.sk",
    },
    update: {
      passwordHash,
    },
    create: {
      email: "psycholog@test.sk",
      passwordHash,
      firstName: "Testovací",
      lastName: "Psychológ",
      role: "PSYCHOLOGIST",
    },
  });

  console.log("Testovací používateľ:");
  console.log({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });