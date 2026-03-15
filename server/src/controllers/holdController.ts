import { Router } from "express";
import { prisma } from "../db";

const createHold = Router();

const HOLD_DURATION_MINUTES = 10;

createHold.post('/', async (req, res) => {
    try {
        const { slotId, email, items } = req.body;

        if (!slotId || !email || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Invalid request body" });
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

            const qty = Number(item.qty);

            if (!Number.isInteger(qty) || qty <= 0) {
                return res.status(400).json({ error: "Invalid quantity" });
            }

            qtyTotal += qty;
            amountTotalCents += ticket.priceCents * qty;

            normalizedItems.push({
                ticketTypeId: ticket.id,
                qty,
                unitPriceCents: ticket.priceCents,
            });
        }

        const expiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60 * 1000);

        const hold = await prisma.$transaction(async (tx) => {
            const slot = await tx.tourSlot.findUnique({
                where: { id: slotId },
                include: {
                    holds: {
                        where: {
                            status: "HELD",
                            expiresAt: {
                                gt: new Date(),
                            },
                        },
                        select: {
                            qtyTotal: true,
                        },
                    },
                },
            });

            if (!slot || !slot.isActive) {
                throw new Error("SLOT_NOT_FOUND");
            }

            const heldSeats = slot.holds.reduce((sum, hold) => sum + hold.qtyTotal, 0);
            const remainingSeats = slot.capacityTotal - heldSeats;

            if (qtyTotal > remainingSeats) {
                throw new Error("INSUFFICIENT_SEATS");
            }

            return tx.hold.create({
                data: {
                    slotId: slot.id,
                    email,
                    items: normalizedItems,
                    qtyTotal,
                    amountTotalCents,
                    expiresAt,
                },
            });
        });

        return res.status(201).json({
            holdId: hold.id,
            expiresAt: hold.expiresAt,
            qtyTotal: hold.qtyTotal,
            amountTotalCents: hold.amountTotalCents,
        });
    } catch (error) {
        if (error instanceof Error) {
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