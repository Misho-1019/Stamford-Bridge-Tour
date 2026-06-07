import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
        console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD env vars");
        process.exit(1);
    }

    if (password.length < 6) {
        console.error("Password must be at least 6 characters");
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await prisma.adminUser.upsert({
        where: { email },
        update: { passwordHash },
        create: { email, passwordHash },
    });

    console.log(`✅ Admin "${admin.email}" created/updated successfully`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
