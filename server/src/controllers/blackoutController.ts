import { Router } from "express";
import { requireAdmin } from "../middleware/admin";
import { DateTime } from "luxon";
import { prisma } from "../db";
import { createBlackoutSchema } from "../schemas/blackout";
import { getZodErrorResponse } from "../lib/zod";

const LONDON_TZ = 'Europe/London';

const blackoutRoutes = Router();

blackoutRoutes.get('/', requireAdmin, async (req, res) => {
    try {
        const rawActive = req.query.active;

        let isActive: boolean | undefined;

        if (rawActive !== undefined) {
            if (rawActive === 'true') {
                isActive = true;
            } else if (rawActive === 'false') {
                isActive = false;
            } else {
                return res.status(400).json({ error: 'active must be true or false' })
            }
        }

        const blackouts = await prisma.blackoutDate.findMany({
            where: isActive === undefined ? {} : { isActive },
            orderBy: {
                date: 'asc',
            }
        })

        return res.json({ blackouts })
    } catch (error) {
        console.error('Failed to fetch blackouts:', error);
        return res.status(500).json({ error: 'Failed to fetch blackouts' });
    }
})

blackoutRoutes.post('/', requireAdmin, async (req, res) => {
    try {
        const parsedBody = createBlackoutSchema.safeParse(req.body)

        if (!parsedBody.success) {
            return res.status(400).json(getZodErrorResponse(parsedBody.error))
        }

        const { date, reason = 'MANUAL' } = parsedBody.data;

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

blackoutRoutes.delete('/:id', requireAdmin, async(req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'Invalid blackout id' })
        }

        const existingBlackout = await prisma.blackoutDate.findUnique({
            where: { id },
        })

        if (!existingBlackout) {
            return res.status(404).json({ error: 'Blackout not found' })
        }

        const blackout = await prisma.blackoutDate.update({
            where: { id },
            data: {
                isActive: false,
            }
        })

        return res.json({ blackout })
    } catch (error) {
        console.error('Failed to deactivate blackout:', error);
        return res.status(500).json({ error: 'Failed to deactivate blackout' });
    }
})

export default blackoutRoutes;