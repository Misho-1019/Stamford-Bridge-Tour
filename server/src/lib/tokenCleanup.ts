import { prisma } from "../db";

const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

export function startTokenCleanup() {
    console.log("Token cleanup cron started (every 24h)");

    const interval = setInterval(async () => {
        try {
            const result = await prisma.refreshToken.deleteMany({
                where: {
                    OR: [
                        { expiresAt: { lt: new Date() } },
                        {
                            revokedAt: {
                                not: null,
                                lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                            }
                        }
                    ]
                }
            })

            if (result.count > 0) {
                console.log(`Token cleanup: removed ${result.count} expired/revoked token(s)`);
            }
        } catch (error) {
            console.error("Token cleanup error:", error);
        }
    }, CLEANUP_INTERVAL_MS);

    return () => clearInterval(interval);
}
