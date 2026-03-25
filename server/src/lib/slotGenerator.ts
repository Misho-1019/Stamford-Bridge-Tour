import { DateTime } from "luxon";
import { prisma } from "../db";
import { getActiveBlackoutByLondonDate } from "./blackout";

const DEFAULT_SLOT_HOURS = [10, 11, 12, 13, 14, 15, 16];
const DEFAULT_CAPACITY = 30;
const LONDON_TZ = 'Europe/London';

export async function generateSlots(days: number) {
    const todayLondon = DateTime.now().setZone(LONDON_TZ).startOf('day')
    let createdCount = 0;

    for (let offset = 0; offset < days; offset++) {
        const day = todayLondon.plus({ days: offset });

        const londonDate = day.toFormat('yyyy-MM-dd')
        const blackout = await getActiveBlackoutByLondonDate(londonDate)

        if (blackout) continue;

        const dayStartUtc = day.startOf('day').toUTC().toJSDate();
        const dayEndUtc = day.endOf('day').toUTC().toJSDate();

        const existingSlotsCount = await prisma.tourSlot.count({
            where: {
                startAt: {
                    gte: dayStartUtc,
                    lte: dayEndUtc,
                }
            }
        })

        if (existingSlotsCount > 0) {
            continue;
        }

        const slotsToCreate = DEFAULT_SLOT_HOURS.map((hour) => {
            const startLondon = day.set({
                hour,
                minute: 0,
                second: 0,
                millisecond: 0,
            })

            const endLondon = startLondon.plus({ hours: 1 });

            return {
                startAt: startLondon.toUTC().toJSDate(),
                endAt: endLondon.toUTC().toJSDate(),
                capacityTotal: DEFAULT_CAPACITY,
                isActive: true,
            }
        })

        const result = await prisma.tourSlot.createMany({
            data: slotsToCreate,
            skipDuplicates: true,
        })
        
        createdCount += result.count;
    }

    return {
        daysRequested: days,
        slotsCreated: createdCount,
    }
}