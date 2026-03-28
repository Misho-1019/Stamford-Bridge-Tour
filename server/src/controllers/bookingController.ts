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
            },
            select: {
                id: true,
                email: true,
                qtyTotal: true,
                amountTotalCents: true,
                status: true,
                createdAt: true,
                slot: {
                    select: {
                        id: true,
                        startAt: true,
                        endAt: true,
                    }
                },
            },
        })

        return res.status(200).json({ bookings })
    } catch (error) {
        console.error("Get my bookings error:", error);
        return res.status(500).json({
            error: "Failed to fetch bookings",
        });
    }
})

bookingController.get('/my-bookings/:id', requireClientAuth, async (req, res) => {
    try {
        const clientId = req.client?.id;
        const bookingId = String(req.params.id);

        if (!clientId) {
            return res.status(401).json({ error: "Unauthorized", });
        }

        const booking = await prisma.booking.findFirst({
            where: {
                id: bookingId,
                clientUserId: clientId,
            },
            select: {
                id: true,
                email: true,
                items: true,
                qtyTotal: true,
                amountTotalCents: true,
                status: true,
                createdAt: true,
                refundedAt: true,
                refundReason: true,
                slot: {
                    select: {
                        id: true,
                        startAt: true,
                        endAt: true,
                    }
                },
            }
        })

        if (!booking) {
            return res.status(401).json({ error: "Unauthorized", });
        }

        return res.status(200).json({ booking })
    } catch (error) {
        console.error("Get client booking details error:", error);
        return res.status(500).json({ error: "Failed to fetch booking", });
    }
})

export default bookingController;