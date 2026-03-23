import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 1️⃣ Ticket Types
  const adult = await prisma.ticketType.upsert({
    where: { name: "Adult" },
    update: { priceCents: 2500, isActive: true },
    create: { name: "Adult", priceCents: 2500, isActive: true },
  });

  const child = await prisma.ticketType.upsert({
    where: { name: "Child" },
    update: { priceCents: 1500, isActive: true },
    create: { name: "Child", priceCents: 1500, isActive: true },
  });

  const student = await prisma.ticketType.upsert({
    where: { name: "Student" },
    update: { priceCents: 2000, isActive: true },
    create: { name: "Student", priceCents: 2000, isActive: true },
  });

  console.log("Ticket types seeded ✅");

  // 2️⃣ Create slots (next 10 days)
  const slots = [];

  for (let i = 0; i < 10; i++) {
    const start = new Date();
    start.setDate(start.getDate() + i);
    start.setHours(14, 0, 0, 0);

    const end = new Date(start);
    end.setHours(start.getHours() + 2);

    const slot = await prisma.tourSlot.upsert({
      where: { startAt: start },
      update: {},
      create: {
        startAt: start,
        endAt: end,
        capacityTotal: 20,
        isActive: true,
      },
    });

    slots.push(slot);
  }

  console.log("Tour slots seeded ✅");

  // 3️⃣ Create bookings
  const statuses = ["CONFIRMED", "CANCELLED", "REFUNDED"] as const;
  const ticketTypes = [adult, child, student];

  for (let i = 0; i < 40; i++) {
    const slot = slots[Math.floor(Math.random() * slots.length)];
    const ticketType =
      ticketTypes[Math.floor(Math.random() * ticketTypes.length)];

    const qty = Math.floor(Math.random() * 4) + 1;
    const status =
      statuses[Math.floor(Math.random() * statuses.length)];

    const amount = qty * ticketType.priceCents;

    await prisma.booking.create({
      data: {
        slotId: slot.id,
        email: `user${i}@example.com`,
        items: [
          {
            ticketTypeId: ticketType.id,
            qty,
            unitPriceCents: ticketType.priceCents,
          },
        ],
        qtyTotal: qty,
        amountTotalCents: amount,
        status,
      },
    });
  }

  console.log("Bookings seeded ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });