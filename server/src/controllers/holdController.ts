import { Router } from "express";
import { prisma } from "../db";
import { getActiveBlackoutByLondonDate, getLondonDateFromUtc } from "../lib/blackout";
import { stripe } from "../lib/stripe";
import { createHoldSchema } from "../schemas/hold";
import { getZodErrorResponse } from "../lib/zod";
import { verifyAccessToken } from "../lib/auth";

const createHold = Router();

const HOLD_DURATION_MINUTES = 10;

createHold.post('/', async (req, res) => {
    try {
        const parsedBody = createHoldSchema.safeParse(req.body)

        if (!parsedBody.success) {
            return res.status(400).json(getZodErrorResponse(parsedBody.error));
        }

        const { slotId, email, items } = parsedBody.data;
        const normalizedEmail = email.trim().toLowerCase();

        let clientId: string | null = null;

        try {
            const accessToken = req.cookies?.accessToken as string | undefined;

            if (accessToken) {
                const decoded = verifyAccessToken(accessToken);

                if (decoded.userType === 'CLIENT') {
                    clientId = decoded.sub;
                }
            }
        } catch {
        }

        let clientEmail: string | null = null;

        if (clientId) {
            const user = await prisma.clientUser.findUnique({
                where: { id: clientId },
                select: { email: true },
            })

            clientEmail = user?.email ?? null;
        }

        const ticketTypes = await prisma.ticketType.findMany({
            where: { isActive: true },
        });

        const ticketMap = new Map(ticketTypes.map((ticket) => [ticket.id, ticket]));

        let qtyTotal = 0;
        let amountTotalCents = 0;

        const normalizedItems: Array<{
            ticketTypeId: string;
            qty: number;
            unitPriceCents: number;
        }> = [];

        for (const item of items) {
            const ticket = ticketMap.get(item.ticketTypeId);

            if (!ticket) {
                return res.status(400).json({ error: "Invalid ticket type" });
            }

            const qty = item.qty;

            qtyTotal += qty;
            amountTotalCents += ticket.priceCents * qty;

            normalizedItems.push({
                ticketTypeId: ticket.id,
                qty,
                unitPriceCents: ticket.priceCents,
            });
        }

        const lineItems = normalizedItems.map((item) => {
            const ticket = ticketMap.get(item.ticketTypeId)

            return {
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: `Stamford Bridge Tour - ${ticket?.name ?? 'Ticket'}`,
                    },
                    unit_amount: item.unitPriceCents,
                },
                quantity: item.qty,
            }
        })

        const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);

        const hold = await prisma.$transaction(async (tx) => {
            const now = new Date();

            await tx.$queryRaw`
                SELECT id
                FROM "TourSlot"
                WHERE id = ${slotId}
                FOR UPDATE
            `

            const slot = await tx.tourSlot.findUnique({
                where: { id: slotId },
                include: {
                    holds: {
                        where: {
                            status: "HELD",
                            expiresAt: {
                                gt: now,
                            },
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
            });

            if (!slot || !slot.isActive) {
                throw new Error("SLOT_NOT_FOUND");
            }

            const londonDate = getLondonDateFromUtc(slot.startAt);

            const blackout = await getActiveBlackoutByLondonDate(londonDate);

            if (blackout) {
                throw new Error("BLACKOUT_DATE");
            }

            const heldSeats = slot.holds.reduce((sum, hold) => sum + hold.qtyTotal, 0);
            const confirmedSeats = slot.bookings.reduce((sum, booking) => sum + booking.qtyTotal, 0)
            const remainingSeats = slot.capacityTotal - heldSeats - confirmedSeats;

            if (qtyTotal > remainingSeats) {
                throw new Error("INSUFFICIENT_SEATS");
            }

            return tx.hold.create({
                data: {
                    slotId: slot.id,
                    email: normalizedEmail,
                    items: normalizedItems,
                    qtyTotal,
                    amountTotalCents,
                    expiresAt,
                },
            });
        });

        let session: Awaited<ReturnType<typeof stripe.checkout.sessions.create>>;

        try {
            session = await stripe.checkout.sessions.create({
                mode: "payment",
                payment_method_types: ["card"],
                line_items: lineItems,
                metadata: {
                    holdId: hold.id,
                    slotId: hold.slotId,
                    email: normalizedEmail,
                    clientUserId: clientId || '',
                    clientEmail: clientEmail || '',
                },
                customer_email: normalizedEmail,
                success_url: `${process.env.APP_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.APP_BASE_URL}/checkout/cancelled`,
            });
        } catch (stripeError) {
            await prisma.hold.update({
                where: { id: hold.id },
                data: {
                    status: "CANCELLED",
                },
            });
        
            throw stripeError;
        }

        await prisma.hold.update({
            where: { id: hold.id },
            data: {
                stripeSessionId: session.id,
            }
        })

        if (!session.url) {
            await prisma.hold.update({
                where: { id: hold.id },
                data: { status: 'CANCELLED' },
            })

            return res.status(500).json({ error: "Stripe checkout URL was not created" })
        }

        return res.status(201).json({
            holdId: hold.id,
            checkoutUrl: session.url,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "BLACKOUT_DATE") {
              return res.status(400).json({ error: "Tours unavailable on this date" });
            }

            if (error.message === "SLOT_NOT_FOUND") {
                return res.status(404).json({ error: "Slot not found" });
            }

            if (error.message === "INSUFFICIENT_SEATS") {
                return res.status(400).json({ error: "Not enough seats available" });
            }
        }

        console.error("Create hold error:", error);
        return res.status(500).json({ error: "Failed to create hold" });
    }
})

export default createHold;