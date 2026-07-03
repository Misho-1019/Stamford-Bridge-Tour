import { useEffect, useState } from "react";
import type { AdminBooking } from "../types/adminBooking";
import { getAdminBookings } from "../api/adminBookings";
import { formatDate, formatDateTime, formatPrice } from "../lib/format";
import { refundBooking } from "../api/adminRefunds";
import { updateAdminBookingStatus } from "../api/adminBookingStatus";
import { generateAdminSlots, syncAdminBlackouts } from "../api/adminOperations";
import { getAdminBookingStats, getAdminRevenueSeries, getAdminSlotStats, getAdminTicketTypeStats, type AdminBookingStats, type AdminRevenueSeriesItem, type AdminSlotStat, type AdminTicketTypeStat } from "../api/adminAnalytics";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useNavigate } from "react-router";
import { SkeletonCard, SkeletonChart } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";

type AdminTab = 'bookings' | 'analytics' | 'slots' | 'tickets' | 'operations';

const ticketTypeDescriptions: Record<string, string> = {
    Adult: "Standard ticket for visitors aged 18 and above.",
    Child: "Reduced ticket for children under 18.",
    Student: "Discounted ticket for students with valid ID.",
}

function toStartOfDayIso(dateValue: string): string | undefined {
    if (!dateValue) {
        return undefined;
    }

    return new Date(`${dateValue}T00:00:00.000Z`).toISOString();
}

function toEndOfDayIso(dateValue: string): string | undefined {
    if (!dateValue) {
        return undefined;
    }

    return new Date(`${dateValue}T23:59:59.999Z`).toISOString();
}

function AdminPage() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<AdminTab>('bookings')

    const [bookings, setBookings] = useState<AdminBooking[]>([])
    const [bookingsPage, setBookingsPage] = useState(1)
    const [bookingsTotalPages, setBookingsTotalPages] = useState(1)
    const [bookingsTotal, setBookingsTotal] = useState(0)
    const [isLoadingBookings, setIsLoadingBookings] = useState(false)
    const [bookingsError, setBookingsError] = useState('')

    const [refundingBookingId, setRefundingBookingId] = useState<string | null>(null);
    const [refundFormBookingId, setRefundFormBookingId] = useState<string | null>(null);
    const [refundReason, setRefundReason] = useState('');
    const [refundFieldError, setRefundFieldError] = useState('')

    const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)

    const [generateDays, setGenerateDays] = useState(30);
    const [syncDaysAhead, setSyncDaysAhead] = useState(30);
    const [isGeneratingSlots, setIsGeneratingSlots] = useState(false)
    const [isSyncingBlackouts, setIsSyncingBlackouts] = useState(false)
    const [operationsError, setOperationsError] = useState("");
    const [operationsSuccess, setOperationsSuccess] = useState("");

    const [bookingStats, setBookingStats] = useState<AdminBookingStats | null>(null)
    const [isLoadingStats, setIsLoadingStats] = useState(false)
    const [statsError, setStatsError] = useState('')

    const [revenueSeries, setRevenueSeries] = useState<AdminRevenueSeriesItem[]>([]);
    const [ticketTypeStats, setTicketTypeStats] = useState<AdminTicketTypeStat[]>([]);
    const [slotStats, setSlotStats] = useState<AdminSlotStat[]>([]);

    const [analyticsFromDate, setAnalyticsFromDate] = useState("");
    const [analyticsToDate, setAnalyticsToDate] = useState("");

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [emailQuery, setEmailQuery] = useState('');
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    async function loadBookings(page: number) {
        try {
            setIsLoadingBookings(true);
            setBookingsError('');

            const data = await getAdminBookings(page, 10, { status: statusFilter, email: emailQuery, from: toStartOfDayIso(fromDate), to: toEndOfDayIso(toDate), });

            setBookings(data.bookings);
            setBookingsPage(data.page);
            setBookingsTotalPages(data.totalPages);
            setBookingsTotal(data.total);
        } catch (error) {
            if (error instanceof Error) {
                setBookingsError(error.message)
                return;
            }
            setBookingsError('Failed to load bookings')
        } finally {
            setIsLoadingBookings(false);
        }
    }

    useEffect(() => {
        if (activeTab !== 'bookings') {
            return;
        }

        loadBookings(bookingsPage);
    }, [activeTab, bookingsPage, statusFilter, emailQuery, fromDate, toDate])

    function getStatusClasses(status: AdminBooking['status']) {
        if (status === "CONFIRMED") {
            return "bg-green-950/40 text-green-300";
        }

        if (status === "CANCELLED") {
            return "bg-yellow-950/40 text-yellow-300";
        }

        return "bg-slate-800/40 text-slate-300";
    }

    async function handleCancelBooking(bookingId: string) {
        try {
            setCancellingBookingId(bookingId)
            setBookingsError('');

            await updateAdminBookingStatus({
                bookingId,
                status: 'CANCELLED',
            })

            if (refundFormBookingId === bookingId) {
                setRefundFormBookingId(null)
                setRefundReason('');
            }

            await loadBookings(bookingsPage);
        } catch (error) {
            if (error instanceof Error) {
                setBookingsError(error.message)
                return;
            }

            setBookingsError('Failed to cancel booking')
        } finally {
            setCancellingBookingId(null);
        }
    }

    async function handleRefund(bookingId: string) {
        if (!refundReason.trim()) {
            setRefundFieldError('Please enter a refund reason');

            return;
        }

        try {
            setRefundingBookingId(bookingId);
            setBookingsError('');

            await refundBooking({
                bookingId,
                reason: refundReason.trim(),
            })

            setRefundFormBookingId(null);
            setRefundReason('');
            setRefundFieldError('');

            await loadBookings(bookingsPage)
        } catch (error) {
            if (error instanceof Error) {
                setBookingsError(error.message)

                return;
            }

            setBookingsError('Failed to refund booking')
        } finally {
            setRefundingBookingId(null);
        }
    }

    async function handleGenerateSlots() {
        try {
            setIsGeneratingSlots(true);
            setOperationsError('')
            setOperationsSuccess('')

            const data = await generateAdminSlots(generateDays);

            setOperationsSuccess(data.message || `Slots generated successfully for the next ${generateDays} days.`)
        } catch (error) {
            if (error instanceof Error) {
                setOperationsError(error.message)

                return;
            }

            setOperationsError('Failed to generate slots')
        } finally {
            setIsGeneratingSlots(false);
        }
    }

    async function handleSyncBlackouts() {
        try {
            setIsSyncingBlackouts(true);
            setOperationsError('')
            setOperationsSuccess('');

            const data = await syncAdminBlackouts(syncDaysAhead);

            setOperationsSuccess(`Blackouts synced successfully with ${data.provider}.`)
        } catch (error) {
            if (error instanceof Error) {
                setOperationsError(error.message)

                return;
            }

            setOperationsError('Failed to sync blackouts')
        } finally {
            setIsSyncingBlackouts(false);
        }
    }

    async function loadBookingStats(fromDate?: string, toDate?: string) {
        try {
            setIsLoadingStats(true)
            setStatsError('');

            const data = await getAdminBookingStats(fromDate, toDate);
            setBookingStats(data)
        } catch (error) {
            if (error instanceof Error) {
                setStatsError(error.message)

                return;
            }

            setStatsError('Failed to load analytics')
        } finally {
            setIsLoadingStats(false);
        }
    }

    async function loadRevenueSeries(fromDate?: string, toDate?: string) {
        try {
            const data = await getAdminRevenueSeries(fromDate, toDate);
            setRevenueSeries(data.data)
        } catch (error) {
            if (error instanceof Error) {
                setStatsError(error.message)

                return;
            }

            setStatsError('Failed to load revenue series')
        }
    }

    async function loadTicketTypeStats(fromDate?: string, toDate?: string) {
        try {
            const data = await getAdminTicketTypeStats(fromDate, toDate);

            setTicketTypeStats(data.data)
        } catch (error) {
            if (error instanceof Error) {
                setStatsError(error.message)

                return;
            }

            setStatsError('Failed to load ticket type stats')
        }
    }

    async function loadSlotStats(fromDate?: string, toDate?: string) {
        try {
            const data = await getAdminSlotStats(fromDate, toDate);

            setSlotStats(data.data)
        } catch (error) {
            if (error instanceof Error) {
                setStatsError(error.message)

                return;
            }

            setStatsError('Failed to load slot stats')
        }
    }

    useEffect(() => {
        if (activeTab !== 'analytics') {
            return;
        }

        async function loadAnalytics() {
            setStatsError('');

            const from = analyticsFromDate || undefined;
            const to = analyticsToDate || undefined;

            await Promise.all([
                loadBookingStats(from, to),
                loadRevenueSeries(from, to),
                loadTicketTypeStats(from, to),
                loadSlotStats(from, to),
            ])
        }

        loadAnalytics();
    }, [activeTab, analyticsFromDate, analyticsToDate])

    const revenueChartData = revenueSeries.map((item) => ({
        date: item.date,
        label: formatDate(item.date),
        revenue: item.revenueCents / 100,
    }))

    const ticketTypeChartData = ticketTypeStats.map((item) => ({
        name: item.ticketTypeName,
        revenue: item.revenueCents / 100,
        qty: item.qty,
    }))
    
    const slotChartData = [...slotStats].sort((a, b) => {
            if (b.usagePercent !== a.usagePercent) {
                return b.usagePercent - a.usagePercent
            }

            return b.revenueCents - a.revenueCents
        }).slice(0, 8).map((slot) => ({
            label: `${formatDateTime(slot.startAt)}`,
            usagePercent: slot.usagePercent,
            revenue: slot.revenueCents / 100,
        }));
    
    const topSlotStats = [...slotStats].sort((a, b) => {
        if (b.usagePercent !== a.usagePercent) {
            return b.usagePercent - a.usagePercent
        }

        return b.revenueCents - a.revenueCents;
    }).slice(0, 8)

    const filteredBookings = bookings.filter(booking => {
        const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;

        const emailMatches = booking.email.toLowerCase().includes(emailQuery.trim().toLowerCase());

        return matchesStatus && emailMatches;
    })

    function handleResetFilters() {
        setStatusFilter("ALL");
        setEmailQuery("");
        setFromDate("");
        setToDate("");
    }

    const hasActiveFilters = statusFilter !== "ALL" || emailQuery.trim() !== "" || fromDate !== "" || toDate !== "";

    useEffect(() => {
        setBookingsPage(1);
    }, [statusFilter, emailQuery, fromDate, toDate]);

    return (
        <section className="space-y-6">
            <header className="mb-2">
                <h1 className="text-2xl font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                    Admin Dashboard
                </h1>
                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Manage bookings, slots, ticket types, and tour operations.
                </p>
            </header>

            <div className="glass-card p-1.5">
                <div className="flex flex-wrap gap-1">
                    {["bookings", "analytics", "slots", "tickets", "operations"].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab as AdminTab)}
                            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                                activeTab === tab ? "" : "hover:text-white"
                            }`}
                            style={activeTab === tab ? { background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37', boxShadow: '0 0 20px rgba(233,195,73,0.1)' } : { color: 'rgba(255,255,255,0.55)' }}
                        >
                            {tab === "bookings" ? "Bookings" : tab === "analytics" ? "Analytics" : tab === "slots" ? "Slots" : tab === "tickets" ? "Ticket Types" : "Operations"}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-xl glass-card p-5 shadow-lg">
                {activeTab === "bookings" && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Bookings
                            </h2>
                            <p className="mt-1 text-sm text-white/80">
                                Total bookings: {bookingsTotal}
                            </p>
                        </div>

                        {isLoadingBookings && (
                            <div className="space-y-3">
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                            </div>
                        )}

                        {bookingsError && (
                            <p className="text-sm text-red-300">
                                {bookingsError}
                            </p>
                        )}

                        {!isLoadingBookings &&
                            !bookingsError &&
                            bookings.length === 0 && (
                                <EmptyState
                                    title="No bookings found"
                                    message="There are no bookings matching your criteria."
                                />
                            )
                        }

                        <div className="mb-4 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-3">
                                <label
                                    htmlFor="statusFilter"
                                    className="text-sm font-medium"
                                    style={{ color: 'rgba(255,255,255,0.65)' }}
                                >
                                    Status
                                </label>
                        
                                <select
                                    id="statusFilter"
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                                    style={{
                                        borderColor: 'rgba(255,255,255,0.10)',
                                        background: 'rgba(255,255,255,0.06)',
                                        backdropFilter: 'blur(8px)',
                                        color: 'rgba(255,255,255,0.85)'
                                    }}
                                >
                                    <option value="ALL">All</option>
                                    <option value="CONFIRMED">Confirmed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                    <option value="REFUNDED">Refunded</option>
                                </select>
                            </div>
                        
                            <div className="flex items-center gap-3">
                                <label
                                    htmlFor="emailQuery"
                                    className="text-sm font-medium"
                                    style={{ color: 'rgba(255,255,255,0.65)' }}
                                >
                                    Email
                                </label>
                        
                                <input
                                    id="emailQuery"
                                    type="text"
                                    value={emailQuery}
                                    onChange={(event) => setEmailQuery(event.target.value)}
                                    placeholder="Search by email"
                                    className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                                    style={{
                                        borderColor: 'rgba(255,255,255,0.10)',
                                        background: 'rgba(255,255,255,0.06)',
                                        backdropFilter: 'blur(8px)',
                                        color: 'rgba(255,255,255,0.85)'
                                    }}
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                    From
                                </label>
                            
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                                    style={{
                                        borderColor: 'rgba(255,255,255,0.10)',
                                        background: 'rgba(255,255,255,0.06)',
                                        backdropFilter: 'blur(8px)',
                                        color: 'rgba(255,255,255,0.85)'
                                    }}
                                />
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                    To
                                </label>
                            
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                                    style={{
                                        borderColor: 'rgba(255,255,255,0.10)',
                                        background: 'rgba(255,255,255,0.06)',
                                        backdropFilter: 'blur(8px)',
                                        color: 'rgba(255,255,255,0.85)'
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleResetFilters}
                                disabled={!hasActiveFilters}
                                className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.60)' }}
                            >
                                Reset
                            </button>
                        </div>

                        {!isLoadingBookings &&
                            !bookingsError &&
                            bookings.length > 0 && (
                                <>
                                    <div className="space-y-3">
                                        {filteredBookings.length === 0 ? (
                                            <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-6 text-sm text-white/80">
                                                <p>No bookings match the current filters.</p>
                                                <p className="mt-1 text-white/60">
                                                    Try changing the status, email, or date range filters.
                                                </p>
                                            </div>
                                        ) : (
                                            filteredBookings.map((booking) => (
                                                <div
                                                    key={booking.id}
                                                    onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                                    className="group cursor-pointer glass-card p-4 transition-all duration-300 hover:translate-x-0.5 hover:border-[rgba(212,175,55,0.15)]" style={{ borderLeft: `4px solid ${booking.status === 'CONFIRMED' ? 'rgba(34,197,94,0.4)' : booking.status === 'CANCELLED' ? 'rgba(234,179,8,0.4)' : 'rgba(255,255,255,0.1)'}` }}
                                                >
                                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                        <div className="space-y-2">
                                                            <p className="font-semibold text-white">
                                                                {booking.email}
                                                            </p>
    
                                                            <p className="text-sm text-white/80">
                                                                Booking ID: {booking.id}
                                                            </p>
    
                                                            <p className="text-sm text-white/80">
                                                                Slot:{" "}
                                                                {formatDateTime(
                                                                    booking.slot.startAt
                                                                )}{" "}
                                                                -{" "}
                                                                {formatDateTime(
                                                                    booking.slot.endAt
                                                                )}
                                                            </p>
    
                                                            <p className="text-sm text-white/80">
                                                                Created:{" "}
                                                                {formatDateTime(
                                                                    booking.createdAt
                                                                )}
                                                            </p>
    
                                                            <p className="text-sm text-white/80">
                                                                Tickets: {booking.qtyTotal}
                                                            </p>
    
                                                            <p className="text-sm font-medium text-white">
                                                                Total:{" "}
                                                                {formatPrice(
                                                                    booking.amountTotalCents
                                                                )}
                                                            </p>
                                                        </div>
    
                                                        <div className="flex flex-col items-start gap-2 md:items-end">
                                                            <p className="text-xs text-white/50 group-hover:text-[#4DA3FF]">
                                                                View details →
                                                            </p>

                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                                    booking.status
                                                                )}`}
                                                            >
                                                                {booking.status}
                                                            </span>
    
                                                            {booking.status === "CONFIRMED" ? (
                                                                <>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleCancelBooking(booking.id)
                                                                        }}
                                                                        disabled={
                                                                            cancellingBookingId === booking.id ||
                                                                            refundingBookingId === booking.id
                                                                        }
                                                                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    >
                                                                        {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel'}
                                                                    </button>
    
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setRefundFormBookingId(booking.id);
                                                                            setRefundReason('');
                                                                            setRefundFieldError('');
                                                                            setBookingsError('');
                                                                        }}
                                                                        disabled={
                                                                            cancellingBookingId === booking.id ||
                                                                            refundingBookingId === booking.id
                                                                        }
                                                                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                                                        >
                                                                        {refundFormBookingId === booking.id ? "Refund Form Open" : refundingBookingId === booking.id ? "Refunding..." : "Refund"}
                                                                    </button>
                                                                </>
                                                            ) : null}
    
                                                            {booking.refundReason && (
                                                                <p className="max-w-xs text-sm text-white/60">
                                                                    Refund reason:{" "}
                                                                    {booking.refundReason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
    
                                                    {refundFormBookingId === booking.id ? (
                                                        <div className="mt-4 rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                                                            <label
                                                                htmlFor={`refund-reason-${booking.id}`}
                                                                className="mb-2 block text-sm font-medium text-white/80"
                                                            >
                                                                Refund reason
                                                            </label>
    
                                                            <input
                                                                id={`refund-reason-${booking.id}`}
                                                                type="text"
                                                                value={refundReason}
                                                                onChange={(event) => {
                                                                    setRefundReason(event.target.value);
                                                                    setRefundFieldError('');
                                                                }}
                                                                placeholder="Enter refund reason"
                                                                className={`w-full rounded border bg-white/90 px-3 py-2 text-slate-900 outline-none focus:border-[#0057d9] focus:ring-1 focus:ring-[#0057d9] ${
                                                                    refundFieldError ? 'border-red-400' : 'border-white/20'
                                                                }`}
                                                            />
    
                                                            {refundFieldError && (
                                                                <p className="mt-2 text-sm text-red-300">
                                                                    {refundFieldError}
                                                                </p>
                                                            )}
                                                    
                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRefund(booking.id);
                                                                    }}
                                                                    disabled={refundingBookingId === booking.id}
                                                                    className="rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                                                                    style={{
                                                                        border: '1px solid rgba(212,175,55,0.35)',
                                                                        background: 'rgba(212,175,55,0.12)',
                                                                        backdropFilter: 'blur(12px)',
                                                                        color: '#D4AF37'
                                                                    }}
                                                                >
                                                                    {refundingBookingId === booking.id
                                                                        ? "Refunding..."
                                                                        : "Confirm Refund"}
                                                                </button>
                                                    
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setRefundFormBookingId(null);
                                                                        setRefundReason("");
                                                                        setRefundFieldError("");
                                                                        setBookingsError("");
                                                                    }}
                                                                    disabled={refundingBookingId === booking.id}
                                                                    className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setBookingsPage((prev) =>
                                                    Math.max(1, prev - 1)
                                                )
                                            }
                                            disabled={bookingsPage === 1}
                                            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Previous
                                        </button>

                                        <p className="text-sm text-white/80">
                                            Page {bookingsPage} of {bookingsTotalPages}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setBookingsPage((prev) =>
                                                    Math.min(
                                                        bookingsTotalPages,
                                                        prev + 1
                                                    )
                                                )
                                            }
                                            disabled={
                                                bookingsPage === bookingsTotalPages
                                            }
                                            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </>
                            )}
                    </div>
                )}

                        {activeTab === "analytics" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Analytics
                            </h2>
                            <p className="mt-2 text-sm text-white/80">
                                Overview of booking activity and revenue performance.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2">
                                <label htmlFor="analytics-from" className="text-sm font-medium text-white/80">From</label>
                                <input
                                    id="analytics-from"
                                    type="date"
                                    value={analyticsFromDate}
                                    onChange={(e) => setAnalyticsFromDate(e.target.value)}
                                    className="rounded border border-white/20 bg-white/90 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0057d9] focus:ring-1 focus:ring-[#0057d9]"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <label htmlFor="analytics-to" className="text-sm font-medium text-white/80">To</label>
                                <input
                                    id="analytics-to"
                                    type="date"
                                    value={analyticsToDate}
                                    onChange={(e) => setAnalyticsToDate(e.target.value)}
                                    className="rounded border border-white/20 bg-white/90 px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#0057d9] focus:ring-1 focus:ring-[#0057d9]"
                                />
                            </div>
                            {(analyticsFromDate || analyticsToDate) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAnalyticsFromDate("");
                                        setAnalyticsToDate("");
                                    }}
                                    className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/20"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                
                        {isLoadingStats && (
                            <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    <SkeletonCard />
                                    <SkeletonCard />
                                    <SkeletonCard />
                                </div>
                                <SkeletonChart />
                                <SkeletonChart />
                            </div>
                        )}
                
                        {statsError && (
                            <p className="text-sm text-red-300">
                                {statsError}
                            </p>
                        )}
                
                        {bookingStats && !isLoadingStats && !statsError && (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <div className="glass-card p-5">
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Total Bookings</p>
                                    <p className="mt-2 text-2xl font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                        {bookingStats.totalBookings}
                                    </p>
                                </div>
                
                                <div className="glass-card p-5">
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Confirmed Bookings</p>
                                    <p className="mt-2 text-2xl font-semibold" style={{ color: '#22C55E' }}>
                                        {bookingStats.confirmedBookings}
                                    </p>
                                </div>
                
                                <div className="glass-card p-5">
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Cancelled Bookings</p>
                                    <p className="mt-2 text-2xl font-semibold" style={{ color: '#EAB308' }}>
                                        {bookingStats.cancelledBookings}
                                    </p>
                                </div>
                
                                <div className="glass-card p-5">
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Refunded Bookings</p>
                                    <p className="mt-2 text-2xl font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                        {bookingStats.refundedBookings}
                                    </p>
                                </div>
                
                                <div className="glass-card p-5">
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Confirmed Revenue</p>
                                    <p className="mt-2 text-2xl font-semibold font-mono-custom" style={{ color: '#D4AF37' }}>
                                        {formatPrice(bookingStats.confirmedRevenueCents)}
                                    </p>
                                </div>
                
                                <div className="glass-card p-5">
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>Refunded Revenue</p>
                                    <p className="mt-2 text-2xl font-semibold font-mono-custom" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                        {formatPrice(bookingStats.refundedRevenueCents)}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="glass-card p-5">
                            <div>
                                <h3 className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                    Revenue Trend
                                </h3>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    Daily revenue over time.
                                </p>
                            </div>
                        
                            <div className="mt-4 h-64">
                                {revenueChartData.length === 0 ? (
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                        No chart data available.
                                    </p>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={revenueChartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            
                                            <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} stroke="rgba(255,255,255,0.06)" />
                            
                                            <YAxis
                                                tickFormatter={(value) => `£${value}`}
                                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                                stroke="rgba(255,255,255,0.06)"
                                            />
                            
                                            <Tooltip
                                                contentStyle={{ background: 'rgba(10,14,26,0.95)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', color: 'white' }}
                                                formatter={(value) => {
                                                    if (value === undefined) return "N/A";
                                                    return [`£${value}`, "Revenue"];
                                                }}
                                                labelFormatter={(label) => `Date: ${label}`}
                                            />
                            
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#D4AF37"
                                                strokeWidth={2.5}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="glass-card p-5">
                            <div>
                                <h3 className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                    Revenue by Day
                                </h3>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    Daily confirmed revenue and booking count.
                                </p>
                            </div>
                        
                            <div className="mt-4 space-y-3">
                                {revenueSeries.length === 0 ? (
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                        No revenue data available.
                                    </p>
                                ) : (
                                    revenueSeries.slice(-7).reverse().map((item) => (
                                        <div
                                            key={item.date}
                                            className="flex flex-col gap-2 rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between"
                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.06)'
                                            }}
                                        >
                                            <div>
                                                <p className="font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                                    {formatDate(item.date)}
                                                </p>
                                                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                                    Bookings: {item.bookings}
                                                </p>
                                            </div>
                        
                                            <p className="text-sm font-semibold font-mono-custom" style={{ color: '#D4AF37' }}>
                                                {formatPrice(item.revenueCents)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="glass-card p-5">
                            <div>
                                <h3 className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                    Ticket Type Performance
                                </h3>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    Revenue and quantity sold by ticket type.
                                </p>
                            </div>
                        
                            <div className="mt-4 space-y-3">
                                {ticketTypeStats.length === 0 ? (
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                        No ticket type data available.
                                    </p>
                                ) : (
                                    ticketTypeStats.map((item) => (
                                        <div
                                            key={item.ticketTypeId}
                                            className="flex flex-col gap-2 rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                        >
                                            <div>
                                                <p className="font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                                    {item.ticketTypeName}
                                                </p>
                                                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                                    Tickets sold: {item.qty}
                                                </p>
                                            </div>
                        
                                            <p className="text-sm font-semibold font-mono-custom" style={{ color: '#D4AF37' }}>
                                                {formatPrice(item.revenueCents)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="glass-card p-5">
                            <div>
                                <h3 className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                    Slot Performance
                                </h3>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    Top-performing tour slots by usage and revenue.
                                </p>
                            </div>
                        
                            <div className="mt-4 space-y-3">
                                {slotStats.length === 0 ? (
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                        No slot performance data available.
                                    </p>
                                ) : (
                                    [...slotStats]
                                        .sort((a, b) => b.usagePercent - a.usagePercent)
                                        .slice(0, 10).map((slot) => (
                                        <div
                                            key={slot.slotId}
                                            className="rounded-lg p-3"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                                        {formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}
                                                    </p>
                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                                        Bookings: {slot.bookingsCount} · Tickets sold: {slot.ticketsSold}
                                                    </p>
                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                                        Capacity: {slot.capacityTotal}
                                                    </p>
                                                    <span
                                                        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                                                        style={{
                                                            background: slot.usagePercent > 80 ? 'rgba(239,68,68,0.1)' : slot.usagePercent > 50 ? 'rgba(234,179,8,0.1)' : 'rgba(34,197,94,0.1)',
                                                            border: `1px solid ${slot.usagePercent > 80 ? 'rgba(239,68,68,0.25)' : slot.usagePercent > 50 ? 'rgba(234,179,8,0.25)' : 'rgba(34,197,94,0.25)'}`,
                                                            color: slot.usagePercent > 80 ? '#EF4444' : slot.usagePercent > 50 ? '#EAB308' : '#22C55E'
                                                        }}
                                                    >
                                                        {slot.usagePercent}% used
                                                    </span>
                                                </div>
                        
                                                <p className="text-sm font-semibold font-mono-custom" style={{ color: '#D4AF37' }}>
                                                    {formatPrice(slot.revenueCents)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "slots" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                Slots
                            </h2>
                            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                Performance overview for the strongest tour slots.
                            </p>
                        </div>
                
                        <div className="glass-card p-5">
                            <div>
                                <h3 className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                    Slot Usage Chart
                                </h3>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    Top-performing slots ranked by usage percentage.
                                </p>
                            </div>
                
                            <div className="mt-4 h-80">
                                {slotChartData.length === 0 ? (
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                        No slot chart data available.
                                    </p>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={slotChartData} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                                <XAxis
                                                    type="number"
                                                    tickFormatter={(value) => `${value}%`}
                                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                                    stroke="rgba(255,255,255,0.06)"
                                                />
                                                <YAxis
                                                    type="category"
                                                    dataKey="label"
                                                    width={180}
                                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                                    stroke="rgba(255,255,255,0.06)"
                                                />
                                                <Tooltip
                                                    contentStyle={{ background: 'rgba(10,14,26,0.95)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', color: 'white' }}
                                                    formatter={(value) => {
                                                        if (value === undefined) return "N/A";
                                                        return [`${value}%`, "Usage"];
                                                    }}
                                                />
                                                <Bar
                                                    dataKey="usagePercent"
                                                    fill="#D4AF37"
                                                    radius={[0, 6, 6, 0]}
                                                />
                                            </BarChart>
                                        </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                
                        <div className="glass-card p-5">
                            <div>
                                <h3 className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                    Top Slot Performance
                                </h3>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    Detailed performance metrics for the highest-usage slots.
                                </p>
                            </div>
                
                            <div className="mt-4 space-y-3">
                                {topSlotStats.length === 0 ? (
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                        No slot performance data available.
                                    </p>
                                ) : (
                                    topSlotStats.map((slot) => (
                                        <div
                                            key={slot.slotId}
                                            className="rounded-lg p-3"
                                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                                        {formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}
                                                    </p>
                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                                        Bookings: {slot.bookingsCount} · Tickets sold: {slot.ticketsSold}
                                                    </p>
                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                                        Capacity: {slot.capacityTotal}
                                                    </p>
                                                    <span
                                                        className="inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold"
                                                        style={{
                                                            background: slot.usagePercent > 80 ? 'rgba(239,68,68,0.1)' : slot.usagePercent > 50 ? 'rgba(234,179,8,0.1)' : 'rgba(34,197,94,0.1)',
                                                            border: `1px solid ${slot.usagePercent > 80 ? 'rgba(239,68,68,0.25)' : slot.usagePercent > 50 ? 'rgba(234,179,8,0.25)' : 'rgba(34,197,94,0.25)'}`,
                                                            color: slot.usagePercent > 80 ? '#EF4444' : slot.usagePercent > 50 ? '#EAB308' : '#22C55E'
                                                        }}
                                                    >
                                                        {slot.usagePercent}% used
                                                    </span>
                                                </div>
                
                                                <p className="text-sm font-semibold font-mono-custom" style={{ color: '#D4AF37' }}>
                                                    {formatPrice(slot.revenueCents)}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "tickets" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                Ticket Types
                            </h2>
                            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                Performance overview by ticket type.
                            </p>
                        </div>

                        <div className="glass-card p-5">
                            <div>
                                <h3 className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                    Ticket Type Revenue Chart
                                </h3>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    Revenue comparison across ticket types.
                                </p>
                            </div>
                        
                            <div className="mt-4 h-72">
                                {ticketTypeChartData.length === 0 ? (
                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                        No chart data available.
                                    </p>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={ticketTypeChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} stroke="rgba(255,255,255,0.06)" />
                                                <YAxis tickFormatter={(value) => `£${value}`} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} stroke="rgba(255,255,255,0.06)" />
                                                <Tooltip
                                                    contentStyle={{ background: 'rgba(10,14,26,0.95)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', color: 'white' }}
                                                    formatter={(value) => {
                                                        if (value === undefined) return "N/A";
                                                        return [`£${value}`, "Revenue"];
                                                    }}
                                                />
                                                <Bar dataKey="revenue" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                
                        {ticketTypeStats.length === 0 ? (
                            <div className="glass-card p-5">
                                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                    No ticket type data available.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="glass-card p-5">
                                    <div>
                                        <h3 className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                            Ticket Type Revenue
                                        </h3>
                                        <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                            Revenue generated by each ticket type.
                                        </p>
                                    </div>
                
                                    <div className="mt-4 space-y-3">
                                        {ticketTypeStats.map((item) => (
                                            <div
                                                key={item.ticketTypeId}
                                                className="flex flex-col gap-2 rounded-lg p-3 sm:flex-row sm:items-center sm:justify-between"
                                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                            >
                                                <div>
                                                    <p className="font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                                        {item.ticketTypeName}
                                                    </p>

                                                    {ticketTypeDescriptions[item.ticketTypeName] && (
                                                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                                            {ticketTypeDescriptions[item.ticketTypeName]}
                                                        </p>
                                                    )}

                                                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                                        Tickets sold: {item.qty}
                                                    </p>
                                                </div>
                
                                                <p className="text-sm font-semibold font-mono-custom" style={{ color: '#D4AF37' }}>
                                                    {formatPrice(item.revenueCents)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {activeTab === "operations" && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                Operations
                            </h2>
                            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                Run admin maintenance tasks for slots and blackouts.
                            </p>
                        </div>
                
                        {operationsError && (
                            <p className="text-sm" style={{ color: '#EF4444' }}>
                                {operationsError}
                            </p>
                        )}
                
                        {operationsSuccess && (
                            <p className="text-sm" style={{ color: '#22C55E' }}>
                                {operationsSuccess}
                            </p>
                        )}
                
                        <div className="glass-card p-5 space-y-4">
                            <div>
                                <h3 className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                    Generate Slots
                                </h3>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    Generate tour slots for the upcoming number of days.
                                </p>
                            </div>
                
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <input
                                    type="number"
                                    min={1}
                                    value={generateDays}
                                    onChange={(event) =>
                                        setGenerateDays(Number(event.target.value))
                                    }
                                    className="w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 sm:max-w-xs"
                                    style={{
                                        borderColor: 'rgba(255,255,255,0.10)',
                                        background: 'rgba(255,255,255,0.06)',
                                        backdropFilter: 'blur(8px)',
                                        color: 'rgba(255,255,255,0.85)'
                                    }}
                                />
                
                                <button
                                    type="button"
                                    onClick={handleGenerateSlots}
                                    disabled={isGeneratingSlots}
                                    className="rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                                    style={{
                                        border: '1px solid rgba(212,175,55,0.35)',
                                        background: 'rgba(212,175,55,0.12)',
                                        backdropFilter: 'blur(12px)',
                                        color: '#D4AF37'
                                    }}
                                >
                                    {isGeneratingSlots ? "Generating..." : "Generate Slots"}
                                </button>
                            </div>
                        </div>
                
                        <div className="glass-card p-5 space-y-4">
                            <div>
                                <h3 className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                    Sync Blackouts
                                </h3>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    Sync blackout dates based on upcoming fixtures.
                                </p>
                            </div>
                
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <input
                                    type="number"
                                    min={1}
                                    value={syncDaysAhead}
                                    onChange={(event) =>
                                        setSyncDaysAhead(Number(event.target.value))
                                    }
                                    className="w-full rounded border px-3 py-2 text-sm outline-none focus:ring-2 sm:max-w-xs"
                                    style={{
                                        borderColor: 'rgba(255,255,255,0.10)',
                                        background: 'rgba(255,255,255,0.06)',
                                        backdropFilter: 'blur(8px)',
                                        color: 'rgba(255,255,255,0.85)'
                                    }}
                                />
                
                                <button
                                    type="button"
                                    onClick={handleSyncBlackouts}
                                    disabled={isSyncingBlackouts}
                                    className="rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                                    style={{
                                        border: '1px solid rgba(212,175,55,0.35)',
                                        background: 'rgba(212,175,55,0.12)',
                                        backdropFilter: 'blur(12px)',
                                        color: '#D4AF37'
                                    }}
                                >
                                    {isSyncingBlackouts ? "Syncing..." : "Sync Blackouts"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdminPage;