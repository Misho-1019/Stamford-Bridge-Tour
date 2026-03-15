import { DateTime } from "luxon";
import { prisma } from "../db";

const LONDON_TZ = 'Europe/London';

export async function getActiveBlackoutByLondonDate(londonDate: string) {
    const parsed = DateTime.fromISO(londonDate, { zone: LONDON_TZ })

    if (!parsed.isValid) {
        return null;
    }

    const jsDate = parsed.startOf('day').toJSDate();

    return prisma.blackoutDate.findFirst({
        where: {
            date: jsDate,
            isActive: true,
        }
    })
}

export function getLondonDateFromUtc(date: Date): string {
    return DateTime.fromJSDate(date, { zone: 'utc' })
        .setZone(LONDON_TZ)
        .toFormat('yyyy-MM-dd')
}

