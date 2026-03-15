import { Router } from "express";
import { requireAdmin } from "../middleware/admin";
import { DateTime } from "luxon";
import { prisma } from "../db";

const LONDON_TZ = 'Europe/London';

const blackoutRoutes = Router();

blackoutRoutes.post('/', requireAdmin, async (req, res) => {
    try {
        const { date, reason = 'MANUAL' } = req.body;

        if (!date || typeof date !== 'string') {
            return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' })
        }

        const parsed = DateTime.fromISO(date, { zone: LONDON_TZ })

        if (!parsed.isValid) {
            return res.status(400).json({ error: "invalid date format" })
        }

        const jsDate = parsed.startOf('day').toJSDate();

        const blackout = await prisma.blackoutDate.upsert({
            where: { date: jsDate },
            update: {
                reason,
                isActive: true,
            },
            create: {
                date: jsDate,
                reason,
                source: 'manual',
                isActive: true,
            },
        })

        res.status(201).json(blackout);
    } catch (error) {
        console.error("Create blackout error:", error);
        res.status(500).json({ error: "Failed to create blackout" });
    }
})

export default blackoutRoutes;