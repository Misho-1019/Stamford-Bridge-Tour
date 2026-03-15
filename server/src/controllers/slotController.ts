import { Router } from "express";
import { DateTime } from "luxon";
import { prisma } from "../db";

const slotController = Router();

const LONDON_TZ = 'Europe/London';
slotController.get('/', async (req, res) => {
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
        return res.status(400).json({ error: 'date query is required' });
    }

    const parsedDate = DateTime.fromISO(date, { zone: LONDON_TZ });

    if (!parsedDate.isValid) {
        return res.status(400).json({ error: 'invalid date format, use YYYY-MM-DD' })
    }

    const startOfDayUtc = parsedDate.startOf('day').toUTC().toJSDate()
    const endOfDayUtc = parsedDate.endOf('day').toUTC().toJSDate()

    try {
        const slots = await prisma.tourSlot.findMany({
            where: {
                isActive: true,
                startAt: {
                    gte: startOfDayUtc,
                    lte: endOfDayUtc,
                },
            },
            include: {
                holds: {
                    where: {
                        status: 'HELD',
                        expiresAt: {
                            gt: new Date(),
                        }
                    },
                    select: {
                        qtyTotal: true,
                    },
                },
                bookings: {
                    where: {
                        status: 'CONFIRMED',
                    },
                    select: {
                        qtyTotal: true,
                    }
                }
            },
            orderBy: {
                startAt: 'asc'
            }
        })

        const slotsWithAvailability = slots.map((slot) => {
            const heldSeats = slot.holds.reduce((sum, h) => sum + h.qtyTotal, 0);
            const confirmedSeats = slot.bookings.reduce((sum, b) => sum + b.qtyTotal, 0);

            const remainingSeats = slot.capacityTotal - heldSeats - confirmedSeats;

            return {
                id: slot.id,
                startAt: slot.startAt,
                endAt: slot.endAt,
                capacityTotal: slot.capacityTotal,
                remainingSeats,
            }
        })

        res.json({
            blocked: false,
            slots: slotsWithAvailability,
        })
    } catch (error) {
        console.error("Error fetching slots:", error);
        res.status(500).json({ error: "Failed to fetch slots" });
    }
})

export default slotController;