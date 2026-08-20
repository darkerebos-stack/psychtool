import { prisma } from "./db.js";

async function main() {
  const user = await prisma.user.create({
    data: {
      email: "psycholog@test.sk",
      passwordHash: "test-password",
      firstName: "Testovací",
      lastName: "Psychológ",
    },
  });

  console.log("Vytvorený používateľ:");
  console.log(user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });