import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.ticketType.upsert({
    where: { name: "Adult" },
    update: { priceCents: 2500, isActive: true },
    create: { name: "Adult", priceCents: 2500, isActive: true },
  });

  await prisma.ticketType.upsert({
    where: { name: "Child" },
    update: { priceCents: 1500, isActive: true },
    create: { name: "Child", priceCents: 1500, isActive: true },
  });

  await prisma.ticketType.upsert({
    where: { name: "Student" },
    update: { priceCents: 2000, isActive: true },
    create: { name: "Student", priceCents: 2000, isActive: true },
  });

  console.log("Seeded ticket types ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });