import { Router } from "express";
import { prisma } from "../db";
import { error } from "node:console";

const createHold = Router();

const HOLD_DURATION_MINUTES = 10;

createHold.post('/', async (req, res) => {
    try {
        const { slotId, email, items } = req.body;

        if (!slotId || !email || !Array.isArray(items)) {
            return res.status(400).json({ error: 'Invalid request body' })
        }

        const slot = await prisma.tourSlot.findUnique({
            where: { id: slotId },
            include: {
                holds: {
                    where: {
                        status: 'HELD',
                        expiresAt: {
                            gt: new Date(),
                        }
                    }
                }
            }
        });

        if (!slot || !slot.isActive) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        const ticketTypes = await prisma.ticketType.findMany({
            where: {
                isActive: true,
            }
        })

        const ticketMap = new Map(
            ticketTypes.map((t) => [t.id, t])
        );

        let qtyTotal = 0;
        let amountTotalCents = 0;

        const normalizedItems = [];

        for (const item of items) {
            const ticket = ticketMap.get(item.ticketTypeId);

            if (!ticket) {
                return res.status(400).json({ error: 'Invalid ticket type' })
            }

            const qty = Number(item.qty);

            if (!Number.isInteger(qty) || qty <= 0) {
                return res.status(400).json({ error: 'Invalid quantity' });
            }

            qtyTotal += qty;
            amountTotalCents += ticket.priceCents * qty;

            normalizedItems.push({
                ticketTypeId: ticket.id,
                qty,
                unitPriceCents: ticket.priceCents,
            })
        }

        const heldSeats = slot.holds.reduce(
            (sum, h) => sum + h.qtyTotal,
            0
        );

        const remainingSeats = slot.capacityTotal - heldSeats;

        if (qtyTotal > remainingSeats) {
            return res.status(400).json({
                error: 'Not enough seats available',
            })
        }

        const expiresAt = new Date(
            Date.now() + HOLD_DURATION_MINUTES * 60 * 1000
        );

        const hold = await prisma.hold.create({
            data: {
                slotId: slot.id,
                email,
                items: normalizedItems,
                qtyTotal,
                amountTotalCents,
                expiresAt,
            }
        })

        res.json({
            holdId: hold.id,
            expiresAt,
            qtyTotal,
            amountTotalCents,
        })
    } catch (error) {
        console.error("Create hold error:", error);
        res.status(500).json({ error: "Failed to create hold" });
    }
})

export default createHold;