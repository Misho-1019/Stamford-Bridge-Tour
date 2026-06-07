import { prisma } from "../db";

const SWEEP_INTERVAL_MS = 60 * 1000;

export function startHoldSweep() {
    console.log("Hold sweep cron started (every 60s)");

    const interval = setInterval(async () => {
        try {
            const result = await prisma.hold.updateMany({
                where: {
                    status: "HELD",
                    expiresAt: { lt: new Date() },
                },
                data: { status: "EXPIRED" },
            });

            if (result.count > 0) {
                console.log(`Hold sweep: expired ${result.count} hold(s)`);
            }
        } catch (error) {
            console.error("Hold sweep error:", error);
        }
    }, SWEEP_INTERVAL_MS);

    return () => clearInterval(interval);
}
