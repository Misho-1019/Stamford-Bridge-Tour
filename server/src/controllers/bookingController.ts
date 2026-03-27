import { Router } from "express";
import { prisma } from "../db";
import { bookingSessionParamsSchema } from "../schemas/booking";
import { getZodErrorResponse } from "../lib/zod";
import { requireClientAuth } from "../middleware/requireClientAuth";

const bookingController = Router();

bookingController.get('/by-session/:sessionId', async (req, res) => {
    try {
        const parsedParams = bookingSessionParamsSchema.safeParse(req.params);

        if (!parsedParams.success) {
            return res.status(400).json(getZodErrorResponse(parsedParams.error));
        }

        const { sessionId } = parsedParams.data;

        const booking = await prisma.booking.findUnique({
            where: {
                stripeSessionId: sessionId,
            },
        })

        if (!booking) {
            return res.json({
                status: 'PENDING',
            })
        }

        return res.json({
            status: 'CONFIRMED',
            booking,
        })
    } catch (error) {
        console.error("Get booking by session error:", error);
        return res.status(500).json({ error: 'Failed to fetch booking status' })
    }
})

bookingController.get('/my-bookings', requireClientAuth, async (req, res) => {
    try {
        const clientId = req.client?.id;

        if (!clientId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const bookings = await prisma.booking.findMany({
            where: {
                clientUserId: clientId,
            },
            orderBy: {
                createdAt: 'desc',
            }
        })

        return res.status(200).json({ bookings })
    } catch (error) {
        console.error("Get my bookings error:", error);
        return res.status(500).json({
            error: "Failed to fetch bookings",
        });
    }
})

export default bookingController;