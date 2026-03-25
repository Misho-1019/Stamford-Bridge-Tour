import { Router } from "express";
import { generateSlots } from "../lib/slotGenerator";
import { requireAdmin } from "../middleware/admin";
import { DatasetFixtureProvider } from "../providers/datasetFixtureProvider";
import { syncBlackouts } from "../lib/syncBlackouts";
import { RealFixtureProvider } from "../providers/realFixtureProvider";
import { prisma } from "../db";
import { BookingStatus, Prisma } from "@prisma/client";
import { BookingRefundError, refundBookingById } from "../services/bookingRefundService";
import { DateTime } from "luxon";
import { adminDateRangeQuerySchema, bookingIdParamsSchema, generateSlotsQuerySchema, getAdminBookingsQuerySchema, syncBlackoutsQuerySchema, updateBookingStatusSchema } from "../schemas/admin";
import { getZodErrorResponse } from "../lib/zod";

const adminController = Router();

adminController.post('/slots/generate', requireAdmin, async (req, res) => {
    const parsedQuery = generateSlotsQuerySchema.safeParse(req.query)

    if (!parsedQuery.success) {
        return res.status(400).json(getZodErrorResponse(parsedQuery.error))
    }

    const { days } = parsedQuery.data

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
        const parsedQuery = syncBlackoutsQuerySchema.safeParse(req.query)

        if (!parsedQuery.success) {
            return res.status(400).json(getZodErrorResponse(parsedQuery.error))
        }

        const { daysAhead } = parsedQuery.data

        try {
            const realProvider = new RealFixtureProvider();
            const result = await syncBlackouts(realProvider, daysAhead, 'football_api');

            return res.json({
                provider: 'real_api',
                ...result,
            });
        } catch (realError) {
            console.error("Real fixture provider failed, falling back to dataset:", realError);

            const datasetProvider = new DatasetFixtureProvider();
            const result = await syncBlackouts(datasetProvider, daysAhead, 'dataset');

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
        const parsedQuery = getAdminBookingsQuerySchema.safeParse(req.query);

        if (!parsedQuery.success) {
            return res.status(400).json(getZodErrorResponse(parsedQuery.error))
        }

        const { page, limit, status, email, slotId } = parsedQuery.data;
        const skip = (page - 1) * limit;

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
        const parsedQuery = adminDateRangeQuerySchema.safeParse(req.query);

        if (!parsedQuery.success) {
            return res.status(400).json(getZodErrorResponse(parsedQuery.error))
        }

        const { fromDate: rawFromDate, toDate: rawToDate } = parsedQuery.data;

        const fromDate = rawFromDate ? new Date(rawFromDate) : undefined;
        const toDate = rawToDate ? new Date(rawToDate) : undefined;

        if (fromDate && Number.isNaN(fromDate.getTime())) {
            return res.status(400).json({ error: 'Invalid fromDate' })
        }

        if (toDate && Number.isNaN(toDate.getTime())) {
            return res.status(400).json({ error: 'Invalid toDate' })
        }

        const where: Prisma.BookingWhereInput = {};

        if (fromDate || toDate) {
            where.createdAt = {};

            if (fromDate) {
                where.createdAt.gte = fromDate;
            }

            if (toDate) {
                where.createdAt.lte = toDate;
            }
        }

        const [
            totalBookings,
            confirmedBookings,
            cancelledBookings,
            refundedBookings,
            confirmedRevenueAgg,
            refundedRevenueAgg,
        ] = await Promise.all([
            prisma.booking.count({ where }),
            prisma.booking.count({
                where: {
                    ...where,
                    status: BookingStatus.CONFIRMED
                }
            }),
            prisma.booking.count({
                where: {
                    ...where,
                    status: BookingStatus.CANCELLED,
                }
            }),
            prisma.booking.count({
                where: {
                    ...where,
                    status: BookingStatus.REFUNDED,
                }
            }),
            prisma.booking.aggregate({
                where: {
                    ...where,
                    status: BookingStatus.CONFIRMED,
                },
                _sum: {
                    amountTotalCents: true,
                }
            }),
            prisma.booking.aggregate({
                where: {
                    ...where,
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

adminController.get('/bookings/revenue-series', requireAdmin, async (req, res) => {
    try {
        const parsedQuery = adminDateRangeQuerySchema.safeParse(req.query);

        if (!parsedQuery.success) {
            return res.status(400).json(getZodErrorResponse(parsedQuery.error))
        }

        const { fromDate: rawFromDate, toDate: rawToDate } = parsedQuery.data;

        const fromDate = rawFromDate ? new Date(rawFromDate) : undefined;
        const toDate = rawToDate ? new Date(rawToDate) : undefined;

        if (fromDate && Number.isNaN(fromDate.getTime())) {
            return res.status(400).json({ error: 'Invalid fromDate' })
        }

        if (toDate && Number.isNaN(toDate.getTime())) {
            return res.status(400).json({ error: 'Invalid toDate' })
        }

        const where: Prisma.BookingWhereInput = {
            status: BookingStatus.CONFIRMED
        }

        if (fromDate || toDate) {
            where.createdAt = {};

            if (fromDate) {
                where.createdAt.gte = fromDate;
            }

            if (toDate) {
                where.createdAt.lte = toDate;
            }
        }

        const bookings = await prisma.booking.findMany({
            where,
            select: {
                createdAt: true,
                amountTotalCents: true,
            }
        })

        const map = new Map<string, { revenueCents: number; bookings: number }>();

        for (const b of bookings) {
            const date = DateTime.fromJSDate(b.createdAt).setZone('Europe/London').toFormat('yyyy-MM-dd');

            if (!map.has(date)) {
                map.set(date, { revenueCents: 0, bookings: 0 })
            }

            const entry = map.get(date)!;
            entry.revenueCents += b.amountTotalCents;
            entry.bookings += 1;
        }

        let startDate = fromDate;
        let endDate = toDate;

        if (!startDate || !endDate) {
            const allDates = Array.from(map.keys()).sort();

            if (allDates.length > 0) {
                startDate = startDate ?? new Date(allDates[0]);
                endDate = endDate ?? new Date(allDates[allDates.length - 1])
            }
        }

        if (!startDate || !endDate) {
            return res.json({ data: [] })
        }

        const data: {
            date: string;
            revenueCents: number;
            bookings: number;
        }[] = [];

        const current = new Date(startDate);

        while (current <= endDate) {
            const dateStr = current.toISOString().split('T')[0];

            const entry = map.get(dateStr);

            data.push({
                date: dateStr,
                revenueCents: entry?.revenueCents ?? 0,
                bookings: entry?.bookings ?? 0,
            })

            current.setDate(current.getDate() + 1)
        }

        return res.json({ data })
    } catch (error) {
        console.error('Failed to fetch revenue series:', error);
        return res.status(500).json({ error: 'Failed to fetch revenue series' });
    }
})

adminController.get('/bookings/ticket-type-stats', requireAdmin, async (req, res) => {
    try {
        const parsedQuery = adminDateRangeQuerySchema.safeParse(req.query);

        if (!parsedQuery.success) {
            return res.status(400).json(getZodErrorResponse(parsedQuery.error))
        }

        const { fromDate: rawFromDate, toDate: rawToDate } = parsedQuery.data;

        const fromDate = rawFromDate ? new Date(rawFromDate) : undefined;
        const toDate = rawToDate ? new Date(rawToDate) : undefined;
        
        if (fromDate && Number.isNaN(fromDate.getTime())) {
            return res.status(400).json({ error: 'Invalid fromDate' })
        }

        if (toDate && Number.isNaN(toDate.getTime())) {
            return res.status(400).json({ error: 'Invalid toDate' })
        }

        const where: Prisma.BookingWhereInput = {
            status: BookingStatus.CONFIRMED
        };

        if (fromDate || toDate) {
            where.createdAt = {};

            if (fromDate) {
                where.createdAt.gte = fromDate;
            }

            if (toDate) {
                where.createdAt.lte = toDate;
            }
        }

        const bookings = await prisma.booking.findMany({
            where,
            select: {
                items: true,
            }
        });

        const statsMap = new Map<string, { ticketTypeId: string; qty: number; revenueCents: number; }>();

        for (const booking of bookings) {
            if (!Array.isArray(booking.items)) {
                continue;
            }

            for (const rawItem of booking.items) {
                if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
                    continue;
                }

                const item = rawItem as {
                    ticketTypeId?: unknown;
                    qty?: unknown;
                    unitPriceCents?: unknown;
                };

                if (typeof item.ticketTypeId !== 'string' || typeof item.qty !== 'number' || typeof item.unitPriceCents !== 'number') {
                    continue;
                }

                const existing = statsMap.get(item.ticketTypeId);

                if (existing) {
                    existing.qty += item.qty;
                    existing.revenueCents += item.qty * item.unitPriceCents;
                } else {
                    statsMap.set(item.ticketTypeId, {
                        ticketTypeId: item.ticketTypeId,
                        qty: item.qty,
                        revenueCents: item.qty * item.unitPriceCents
                    })
                }
            }
        }

        const ticketTypeIds = Array.from(statsMap.keys());

        const ticketTypes = await prisma.ticketType.findMany({
            where: {
                id: {
                    in: ticketTypeIds
                }
            },
            select: {
                id: true,
                name: true,
            }
        })

        const ticketTypeNameMap = new Map(ticketTypes.map((ticketType) => [ticketType.id, ticketType.name]))

        const data = Array.from(statsMap.values()).map((entry) => ({
            ticketTypeId: entry.ticketTypeId,
            ticketTypeName: ticketTypeNameMap.get(entry.ticketTypeId) ?? 'Unknown ticket type',
            qty: entry.qty,
            revenueCents: entry.revenueCents
        }))
        .sort((a, b) => b.revenueCents - a.revenueCents);

        return res.json({ data })
    } catch (error) {
        console.error('Failed to fetch ticket type stats:', error);
        return res.status(500).json({ error: 'Failed to fetch ticket type stats' });
    }
})

adminController.get('/bookings/slot-stats', requireAdmin, async (req, res) => {
    try {
        const parsedQuery = adminDateRangeQuerySchema.safeParse(req.query);

        if (!parsedQuery.success) {
            return res.status(400).json(getZodErrorResponse(parsedQuery.error))
        }

        const { fromDate: rawFromDate, toDate: rawToDate } = parsedQuery.data;

        const fromDate = rawFromDate ? new Date(rawFromDate) : undefined;
        const toDate = rawToDate ? new Date(rawToDate) : undefined;

        if (fromDate && Number.isNaN(fromDate.getTime())) {
            return res.status(400).json({ error: 'Invalid fromDate' })
        }

        if (toDate && Number.isNaN(toDate.getTime())) {
            return res.status(400).json({ error: 'Invalid toDate' })
        }
    
        const bookingWhere: Prisma.BookingWhereInput = {
          status: BookingStatus.CONFIRMED
        };
    
        if (fromDate || toDate) {
          bookingWhere.createdAt = {};
    
          if (fromDate) {
            bookingWhere.createdAt.gte = fromDate;
          }
    
          if (toDate) {
            bookingWhere.createdAt.lte = toDate;
          }
        }

        const slots = await prisma.tourSlot.findMany({
            orderBy: {
                startAt: 'asc'
            }
        })
    
        const bookings = await prisma.booking.findMany({
          where: bookingWhere,
        });

        const statsMap = new Map<
            string,
            {
                bookingsCount: number;
                ticketsSold: number;
                revenueCents: number;
            }
        >();

        for (const booking of bookings) {
            const existing = statsMap.get(booking.slotId)

            if (existing) {
                existing.bookingsCount += 1;
                existing.ticketsSold += booking.qtyTotal;
                existing.revenueCents += booking.amountTotalCents;
            } else {
                statsMap.set(booking.slotId, {
                    bookingsCount: 1,
                    ticketsSold: booking.qtyTotal,
                    revenueCents: booking.amountTotalCents,
                })
            }
        }

        const data = slots.map((slot) => {
            const stats = statsMap.get(slot.id);

            const bookingsCount = stats?.bookingsCount ?? 0;
            const ticketsSold = stats?.ticketsSold ?? 0
            const revenueCents = stats?.revenueCents ?? 0;

            return {
                slotId: slot.id,
                startAt: slot.startAt,
                endAt: slot.endAt,
                capacityTotal: slot.capacityTotal,
                bookingsCount,
                ticketsSold,
                revenueCents,
                usagePercent: slot.capacityTotal > 0
                    ? Math.round((ticketsSold / slot.capacityTotal) * 100)
                    : 0
            }
        })

        return res.json({ data })
    } catch (error) {
        console.error('Failed to fetch slot stats:', error);
        return res.status(500).json({ error: 'Failed to fetch slot stats' });
    }
})

adminController.get('/bookings/:id', requireAdmin, async (req, res) => {
    try {
        const parsedParams = bookingIdParamsSchema.safeParse(req.params);

        if (!parsedParams.success) {
            return res.status(400).json(getZodErrorResponse(parsedParams.error))
        }

        const { id } = parsedParams.data;

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
        const parsedParams = bookingIdParamsSchema.safeParse(req.params);

        if (!parsedParams.success) {
            return res.status(400).json(getZodErrorResponse(parsedParams.error));
        }

        const parsedBody = updateBookingStatusSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json(getZodErrorResponse(parsedBody.error));
        }

        const { id } = parsedParams.data;
        const { status: nextStatus, reason, amountCents } = parsedBody.data;

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

        if (nextStatus === BookingStatus.REFUNDED) {
            const result = await refundBookingById({ bookingId: id, reason, amountCents });

            const booking = await prisma.booking.findUnique({
                where: { id: result.booking.id },
                include: {
                    slot: true,
                }
            })

            return res.json({
                booking,
                refundId: result.refund.id,
            })
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
        if (error instanceof BookingRefundError) {
            return res.status(error.statusCode).json({ error: error.message })
        }
        console.error('Failed to update booking status:', error);
        return res.status(500).json({ error: 'Failed to update booking status' });
    }
})

export default adminController;