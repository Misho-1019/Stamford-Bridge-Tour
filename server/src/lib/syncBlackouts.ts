import { DateTime } from "luxon";
import { FixtureProvider } from "../types/fixture";
import { prisma } from "../db";

const LONDON_TZ = "Europe/London";

export async function syncBlackouts(
    provider: FixtureProvider,
    daysAhead: number
) {
    const fixtures = await provider.getFixtures(daysAhead);

    const homeFixtures = fixtures.filter((fixture) => fixture.isHome);

    let syncedCount = 0;

    for (const fixture of homeFixtures) {
        const londonDate = DateTime.fromISO(fixture.kickoffAt, { zone: 'utc' })
            .setZone(LONDON_TZ)
            .startOf('day')
            .toJSDate();
        
        await prisma.blackoutDate.upsert({
            where: {
                date: londonDate,
            },
            update: {
                reason: "MATCHDAY",
                source: "dataset",
                sourceEventId: fixture.id,
                opponent: fixture.opponent,
                competition: fixture.competition,
                kickoffAt: new Date(fixture.kickoffAt),
                isActive: true,
            },
            create: {
                date: londonDate,
                reason: "MATCHDAY",
                source: "dataset",
                sourceEventId: fixture.id,
                opponent: fixture.opponent,
                competition: fixture.competition,
                kickoffAt: new Date(fixture.kickoffAt),
                isActive: true,
            }
        })

        syncedCount++;
    }

    return {
        fixturesFetched: fixtures.length,
        homeFixtures: homeFixtures.length,
        syncedCount,
    }
}