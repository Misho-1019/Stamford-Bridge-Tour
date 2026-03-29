import { Router } from "express";
import { prisma } from "../db";
import { bookingSessionParamsSchema } from "../schemas/booking";
import { getZodErrorResponse } from "../lib/zod";
import { requireClientAuth } from "../middleware/requireClientAuth";

const bookingController = Router();

bookingController.get("/by-session/:sessionId", async (req, res) => {
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
                status: "PENDING",
            })
        }

        return res.json({
            status: "CONFIRMED",
            booking,
        });
    } catch (error) {
        console.error("Get booking by session error:", error);
        return res.status(500).json({ error: "Failed to fetch booking status" });
    }
});

bookingController.get("/my-bookings", requireClientAuth, async (req, res) => {
    try {
        const clientId = req.client?.id;
        const type = req.query.type as string | undefined;

        if (!clientId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const now = new Date();

        const bookings = await prisma.booking.findMany({
            where: {
                clientUserId: clientId,
                ...(type === 'upcoming' && {
                    status: 'CONFIRMED',
                    slot: {
                        startAt: {
                            gte: now,
                        }
                    }
                }),
                ...(type === 'past' && {
                    OR: [{
                        slot: {
                            startAt: {
                                lt: now,
                            }
                        }
                    }, {
                        status: {
                            in: ['CANCELLED', 'REFUNDED'],
                        }
                    }]
                })
            },
            orderBy:
                type === 'upcoming' 
                    ? {
                        slot: {
                            startAt: 'asc',
                        },
                    }
                    : {
                        slot: {
                            startAt: 'desc',
                        }
                    },
            select: {
                id: true,
                email: true,
                items: true,
                qtyTotal: true,
                amountTotalCents: true,
                status: true,
                createdAt: true,
                slot: {
                    select: {
                        id: true,
                        startAt: true,
                        endAt: true,
                    },
                },
            },
        });

        const allTicketTypeIds = new Set<string>();

        for (const booking of bookings) {
            if (Array.isArray(booking.items)) {
                for (const item of booking.items as Array<{
                    ticketTypeId?: string;
                }>) {
                    if (item.ticketTypeId) {
                        allTicketTypeIds.add(item.ticketTypeId);
                    }
                }
            }
        }

        const ticketTypes = await prisma.ticketType.findMany({
            where: {
                id: {
                    in: Array.from(allTicketTypeIds),
                },
            },
        });

        const ticketMap = new Map(ticketTypes.map((ticket) => [ticket.id, ticket.name]));

        const formattedBookings = bookings.map((booking) => {
            let ticketSummary: string[] = [];

            if (Array.isArray(booking.items)) {
                ticketSummary = (booking.items as Array<{
                    ticketTypeId: string;
                    qty: number;
                    unitPriceCents: number;
                }>).map((item) => {
                    const name = ticketMap.get(item.ticketTypeId) || "Ticket";
                    return `${name} × ${item.qty}`;
                });
            }

            return {
                ...booking,
                ticketSummary,
            };
        });

        return res.status(200).json({
            bookings: formattedBookings,
        });
    } catch (error) {
        console.error("Get my bookings error:", error);
        return res.status(500).json({
            error: "Failed to fetch bookings",
        });
    }
});

bookingController.get("/my-bookings/:id", requireClientAuth, async (req, res) => {
    try {
        const clientId = req.client?.id;
        const bookingId = req.params.id;

        if (!clientId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        if (!bookingId || Array.isArray(bookingId)) {
            return res.status(400).json({ error: "Invalid booking id" });
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
                    },
                },
            },
        });

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (!booking.items || !Array.isArray(booking.items)) {
            return res.status(500).json({ error: "Invalid booking items format" });
        }

        const items = booking.items as Array<{
            ticketTypeId: string;
            qty: number;
            unitPriceCents: number;
        }>;

        const ticketTypeIds = items.map((item) => item.ticketTypeId);

        const ticketTypes = await prisma.ticketType.findMany({
            where: {
                id: {
                    in: ticketTypeIds,
                },
            },
        });

        const ticketMap = new Map(ticketTypes.map((ticket) => [ticket.id, ticket.name]));

        const itemsWithNames = items.map((item) => ({
            ...item,
            ticketName: ticketMap.get(item.ticketTypeId) || "Unknown",
        }));

        return res.status(200).json({
            booking: {
                ...booking,
                items: itemsWithNames,
            },
        });
    } catch (error) {
        console.error("Get client booking details error:", error);
        return res.status(500).json({ error: "Failed to fetch booking" });
    }
});

export default bookingController;