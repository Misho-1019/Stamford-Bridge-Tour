import { Router } from "express";
import { generateSlots } from "../lib/slotGenerator";
import { requireAdmin } from "../middleware/admin";
import { DatasetFixtureProvider } from "../providers/datasetFixtureProvider";
import { syncBlackouts } from "../lib/syncBlackouts";
import { RealFixtureProvider } from "../providers/realFixtureProvider";
import { prisma } from "../db";
import { BookingStatus, Prisma } from "@prisma/client";

const adminController = Router();

adminController.post('/slots/generate', requireAdmin, async (req, res) => {
    const rawDays = req.query.days;
    const days = rawDays ? Number(rawDays) : 60;

    if (!Number.isInteger(days) || days <= 0) {
        return res.status(400).json({ error: 'days must be a positive integer' });
    }

    try {
        const result = await generateSlots(days)

        res.json(result);
    } catch (error) {
        console.error('Error generating slots:', error);
        res.status(500).json({ error: 'Failed to generate slots' });
    }
})

adminController.post('/blackouts/sync', requireAdmin, async (req, res) => {
    try {
        const rawDaysAhead = req.query.daysAhead;
        const daysAhead = rawDaysAhead ? Number(rawDaysAhead) : 180;

        if (!Number.isInteger(daysAhead) || daysAhead <= 0) {
            return res.status(400).json({ error: 'daysAhead must be a positive integer' })
        }

        try {
            const realProvider = new RealFixtureProvider();
            const result = await syncBlackouts(realProvider, daysAhead);

            return res.json({
                provider: 'real_api',
                ...result,
            });
        } catch (realError) {
            console.error("Real fixture provider failed, falling back to dataset:", realError);

            const datasetProvider = new DatasetFixtureProvider();
            const result = await syncBlackouts(datasetProvider, daysAhead);
    
            return res.json({
                provider: 'dataset_fallback',
                ...result,
            });
        }
    } catch (error) {
        console.error("Sync blackouts error:", error);
        return res.status(500).json({ error: "Failed to sync blackouts" });
    }
})

adminController.get('/bookings', requireAdmin, async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const skip = (page - 1) * limit;

        const rawStatus = typeof req.query.status === 'string' ? req.query.status : undefined;

        const email = typeof req.query.email === 'string' ? req.query.email.trim() : undefined;

        const slotId = typeof req.query.slotId === 'string' ? req.query.slotId : undefined;

        let status: BookingStatus | undefined;

        if (rawStatus) {
            if (!Object.values(BookingStatus).includes(rawStatus as BookingStatus)) {
                return res.status(400).json({ error: 'Invalid status' })
            }

            status = rawStatus as BookingStatus;
        }

        const where: Prisma.BookingWhereInput = {};

        if (status) {
            where.status = status;
        }

        if (email) {
            where.email = {
                contains: email,
                mode: 'insensitive',
            }
        }

        if (slotId) {
            where.slotId = slotId;
        }

        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
                include: {
                    slot: true,
                }
            }),
            prisma.booking.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return res.json({
            page,
            limit,
            total,
            totalPages,
            bookings,
        })
    } catch (error) {
        console.error('Failed to fetch admin bookings:', error);
        return res.status(500).json({ error: 'Failed to fetch bookings' });
    }
})

adminController.get('/bookings/stats', requireAdmin, async (req, res) => {
    try {
        const [
            totalBookings,
            confirmedBookings,
            cancelledBookings,
            refundedBookings,
            confirmedRevenueAgg,
            refundedRevenueAgg,
        ] = await Promise.all([
            prisma.booking.count(),
            prisma.booking.count({
                where: {
                    status: BookingStatus.CONFIRMED
                }
            }),
            prisma.booking.count({
                where: {
                    status: BookingStatus.CANCELLED,
                }
            }),
            prisma.booking.count({
                where: {
                    status: BookingStatus.REFUNDED,
                }
            }),
            prisma.booking.aggregate({
                where: {
                    status: BookingStatus.CONFIRMED,
                },
                _sum: {
                    amountTotalCents: true,
                }
            }),
            prisma.booking.aggregate({
                where: {
                    status: BookingStatus.REFUNDED,
                },
                _sum: {
                    amountTotalCents: true,
                }
            })
        ])

        return res.json({
            totalBookings,
            confirmedBookings,
            cancelledBookings,
            refundedBookings,
            confirmedRevenueCents: confirmedRevenueAgg._sum.amountTotalCents ?? 0,
            refundedRevenueCents: refundedRevenueAgg._sum.amountTotalCents ?? 0,
        })
    } catch (error) {
        console.error('Failed to fetch admin booking stats:', error);
        return res.status(500).json({ error: 'Failed to fetch booking stats' });
    }
})

adminController.get('/bookings/:id', requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;

        if (typeof id !== 'string') {
            return res.status(400).json({ error: 'Invalid booking id' })
        }

        const booking = await prisma.booking.findUnique({
            where: {
                id,
            },
            include: {
                slot: true,
            }
        })

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' })
        }

        return res.json({
            booking,
        })
    } catch (error) {
        console.error('Failed to fetch booking:', error);
        return res.status(500).json({ error: 'Failed to fetch booking' });
    }
})

adminController.patch('/bookings/:id/status', requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;

        if (typeof id !== 'string') {
            return res.status(400).json({ error: 'Invalid booking id' })
        }

        const rawStatus = req.body?.status;

        if (typeof rawStatus !== 'string') {
            return res.status(400).json({ error: 'Status is required' })
        }

        if (!Object.values(BookingStatus).includes(rawStatus as BookingStatus)) {
            return res.status(400).json({ error: 'Invalid status' })
        }

        const nextStatus = rawStatus as BookingStatus;

        const existingBooking = await prisma.booking.findUnique({
            where: { id },
        })

        if (!existingBooking) {
            return res.status(400).json({ error: 'Booking not found' })
        }

        const currentStatus = existingBooking.status;

        if (currentStatus === nextStatus) {
            return res.status(400).json({ error: 'Booking already has this status' })
        }

        const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
            CONFIRMED: [BookingStatus.CANCELLED, BookingStatus.REFUNDED],
            CANCELLED: [BookingStatus.REFUNDED],
            REFUNDED: []
        }

        const canTransition = allowedTransitions[currentStatus].includes(nextStatus);

        if (!canTransition) {
            return res.status(400).json({ error: `Cannot change booking status from ${currentStatus} to ${nextStatus}` });
        }

        const booking = await prisma.booking.update({
            where: { id },
            data: { status: nextStatus },
            include: {
                slot: true,
            }
        })

        return res.json({
            booking,
        })
    } catch (error) {
        console.error('Failed to update booking status:', error);
        return res.status(500).json({ error: 'Failed to update booking status' });
    }
})

export default adminController;