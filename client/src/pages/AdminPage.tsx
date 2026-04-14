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

        // Refetch after 1s to catch any delayed state updates
        const timer = setTimeout(() => {
            loadBookings(bookingsPage);
        }, 1000);

        return () => clearTimeout(timer);
    }, [activeTab, bookingsPage, statusFilter, emailQuery, fromDate, toDate])

    function getStatusClasses(status: AdminBooking['status']) {
        if (status === "CONFIRMED") {
            return "bg-green-100 text-green-700";
        }

        if (status === "CANCELLED") {
            return "bg-yellow-100 text-yellow-800";
        }

        return "bg-slate-200 text-slate-700";
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

    async function loadBookingStats() {
        try {
            setIsLoadingStats(true)
            setStatsError('');

            const data = await getAdminBookingStats();
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

    async function loadRevenueSeries() {
        try {
            const data = await getAdminRevenueSeries();
            setRevenueSeries(data.data)
        } catch (error) {
            if (error instanceof Error) {
                setStatsError(error.message)

                return;
            }

            setStatsError('Failed to load revenue series')
        }
    }

    async function loadTicketTypeStats() {
        try {
            const data = await getAdminTicketTypeStats();

            setTicketTypeStats(data.data)
        } catch (error) {
            if (error instanceof Error) {
                setStatsError(error.message)

                return;
            }

            setStatsError('Failed to load ticket type stats')
        }
    }

    async function loadSlotStats() {
        try {
            const data = await getAdminSlotStats();

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

            await Promise.all([
                loadBookingStats(),
                loadRevenueSeries(),
                loadTicketTypeStats(),
                loadSlotStats(),
            ])
        }

        loadAnalytics();
    }, [activeTab])

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

    useEffect(() => {
        setBookingsPage(1);
    }, [statusFilter, emailQuery, fromDate, toDate]);

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-blue-900">
                    Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                    Manage bookings, slots, ticket types, and tour operations.
                </p>
            </div>

            <div className="rounded-xl bg-white/90 p-3 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab("bookings")}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                            activeTab === "bookings"
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                    >
                        Bookings
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("analytics")}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                            activeTab === "analytics"
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                    >
                        Analytics
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("slots")}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                            activeTab === "slots"
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                    >
                        Slots
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("tickets")}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                            activeTab === "tickets"
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                    >
                        Ticket Types
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("operations")}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                            activeTab === "operations"
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                    >
                        Operations
                    </button>
                </div>
            </div>

            <div className="rounded-xl bg-white/95 p-5 shadow-md">
                {activeTab === "bookings" && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-blue-900">
                                Bookings
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Total bookings: {bookingsTotal}
                            </p>
                        </div>

                        {isLoadingBookings && (
                            <p className="text-sm text-slate-600">
                                Loading bookings...
                            </p>
                        )}

                        {bookingsError && (
                            <p className="text-sm text-red-600">
                                {bookingsError}
                            </p>
                        )}

                        {!isLoadingBookings &&
                            !bookingsError &&
                            bookings.length === 0 && (
                                <p className="text-sm text-slate-600">
                                    No bookings found.
                                </p>
                            )
                        }

                        <div className="mb-4 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-3">
                                <label
                                    htmlFor="statusFilter"
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Status
                                </label>
                        
                                <select
                                    id="statusFilter"
                                    value={statusFilter}
                                    onChange={(event) => setStatusFilter(event.target.value)}
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-700"
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
                                    className="text-sm font-medium text-slate-700"
                                >
                                    Email
                                </label>
                        
                                <input
                                    id="emailQuery"
                                    type="text"
                                    value={emailQuery}
                                    onChange={(event) => setEmailQuery(event.target.value)}
                                    placeholder="Search by email"
                                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-700"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-slate-700">
                                    From
                                </label>
                            
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                />
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-slate-700">
                                    To
                                </label>
                            
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
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
                                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                                                No bookings match the current filters.
                                            </div>
                                        ) : (
                                            filteredBookings.map((booking) => (
                                                <div
                                                    key={booking.id}
                                                    onClick={() => navigate(`/admin/bookings/${booking.id}`)}
                                                    className="cursor-pointer rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:bg-slate-50 hover:shadow-md"
                                                >
                                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                        <div className="space-y-2">
                                                            <p className="font-semibold text-slate-900">
                                                                {booking.email}
                                                            </p>
    
                                                            <p className="text-sm text-slate-600">
                                                                Booking ID: {booking.id}
                                                            </p>
    
                                                            <p className="text-sm text-slate-600">
                                                                Slot:{" "}
                                                                {formatDateTime(
                                                                    booking.slot.startAt
                                                                )}{" "}
                                                                -{" "}
                                                                {formatDateTime(
                                                                    booking.slot.endAt
                                                                )}
                                                            </p>
    
                                                            <p className="text-sm text-slate-600">
                                                                Created:{" "}
                                                                {formatDateTime(
                                                                    booking.createdAt
                                                                )}
                                                            </p>
    
                                                            <p className="text-sm text-slate-600">
                                                                Tickets: {booking.qtyTotal}
                                                            </p>
    
                                                            <p className="text-sm font-medium text-slate-800">
                                                                Total:{" "}
                                                                {formatPrice(
                                                                    booking.amountTotalCents
                                                                )}
                                                            </p>
                                                        </div>
    
                                                        <div className="flex flex-col items-start gap-2 md:items-end">
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
                                                                        className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
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
                                                                        className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                                                                        >
                                                                        {refundFormBookingId === booking.id ? "Refund Form Open" : refundingBookingId === booking.id ? "Refunding..." : "Refund"}
                                                                    </button>
                                                                </>
                                                            ) : null}
    
                                                            {booking.refundReason && (
                                                                <p className="max-w-xs text-sm text-slate-600">
                                                                    Refund reason:{" "}
                                                                    {booking.refundReason}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
    
                                                    {refundFormBookingId === booking.id ? (
                                                        <div className="mt-4 rounded-xl border border-slate-200 bg-white/90 p-4">
                                                            <label
                                                                htmlFor={`refund-reason-${booking.id}`}
                                                                className="mb-2 block text-sm font-medium text-slate-700"
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
                                                                className={`w-full rounded border bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-700 ${
                                                                    refundFieldError ? 'border-red-400' : 'border-slate-300'
                                                                }`}
                                                            />
    
                                                            {refundFieldError && (
                                                                <p className="mt-2 text-sm text-red-600">
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
                                                                    className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
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
                                                                    className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
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
                                            className="rounded bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Previous
                                        </button>

                                        <p className="text-sm text-slate-600">
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
                                            className="rounded bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
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
                            <h2 className="text-lg font-semibold text-blue-900">
                                Analytics
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Overview of booking activity and revenue performance.
                            </p>
                        </div>
                
                        {isLoadingStats && (
                            <p className="text-sm text-slate-600">
                                Loading analytics...
                            </p>
                        )}
                
                        {statsError && (
                            <p className="text-sm text-red-600">
                                {statsError}
                            </p>
                        )}
                
                        {bookingStats && !isLoadingStats && !statsError && (
                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                                    <p className="text-sm text-slate-600">Total Bookings</p>
                                    <p className="mt-2 text-2xl font-semibold text-blue-900">
                                        {bookingStats.totalBookings}
                                    </p>
                                </div>
                
                                <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                                    <p className="text-sm text-slate-600">Confirmed Bookings</p>
                                    <p className="mt-2 text-2xl font-semibold text-green-700">
                                        {bookingStats.confirmedBookings}
                                    </p>
                                </div>
                
                                <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                                    <p className="text-sm text-slate-600">Cancelled Bookings</p>
                                    <p className="mt-2 text-2xl font-semibold text-yellow-700">
                                        {bookingStats.cancelledBookings}
                                    </p>
                                </div>
                
                                <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                                    <p className="text-sm text-slate-600">Refunded Bookings</p>
                                    <p className="mt-2 text-2xl font-semibold text-slate-700">
                                        {bookingStats.refundedBookings}
                                    </p>
                                </div>
                
                                <div className="rounded-xl bg-white/95 p-5 shadow-md">
                                    <p className="text-sm text-slate-600">Confirmed Revenue</p>
                                    <p className="mt-2 text-2xl font-semibold text-blue-900">
                                        {formatPrice(bookingStats.confirmedRevenueCents)}
                                    </p>
                                </div>
                
                                <div className="rounded-xl bg-white/95 p-5 shadow-md">
                                    <p className="text-sm text-slate-600">Refunded Revenue</p>
                                    <p className="mt-2 text-2xl font-semibold text-slate-800">
                                        {formatPrice(bookingStats.refundedRevenueCents)}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                            <div>
                                <h3 className="text-base font-semibold text-blue-900">
                                    Revenue Trend
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    Daily revenue over time.
                                </p>
                            </div>
                        
                            <div className="mt-4 h-64">
                                {revenueChartData.length === 0 ? (
                                    <p className="text-sm text-slate-600">
                                        No chart data available.
                                    </p>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={revenueChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                        
                                            <XAxis dataKey="label" />
                        
                                            <YAxis
                                                tickFormatter={(value) => `£${value}`}
                                            />
                        
                                            <Tooltip
                                                formatter={(value) => {
                                                    if (value === undefined) return "N/A";
                                                    return [`£${value}`, "Revenue"];
                                                }}
                                                labelFormatter={(label) => `Date: ${label}`}
                                            />
                        
                                            <Line
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#1d4ed8"
                                                strokeWidth={3}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                            <div>
                                <h3 className="text-base font-semibold text-blue-900">
                                    Revenue by Day
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    Daily confirmed revenue and booking count.
                                </p>
                            </div>
                        
                            <div className="mt-4 space-y-3">
                                {revenueSeries.length === 0 ? (
                                    <p className="text-sm text-slate-600">
                                        No revenue data available.
                                    </p>
                                ) : (
                                    revenueSeries.slice(-7).reverse().map((item) => (
                                        <div
                                            key={item.date}
                                            className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white/90 p-3 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {formatDate(item.date)}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    Bookings: {item.bookings}
                                                </p>
                                            </div>
                        
                                            <p className="text-sm font-semibold text-blue-900">
                                                {formatPrice(item.revenueCents)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                            <div>
                                <h3 className="text-base font-semibold text-blue-900">
                                    Ticket Type Performance
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    Revenue and quantity sold by ticket type.
                                </p>
                            </div>
                        
                            <div className="mt-4 space-y-3">
                                {ticketTypeStats.length === 0 ? (
                                    <p className="text-sm text-slate-600">
                                        No ticket type data available.
                                    </p>
                                ) : (
                                    ticketTypeStats.map((item) => (
                                        <div
                                            key={item.ticketTypeId}
                                            className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white/90 p-3 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {item.ticketTypeName}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    Tickets sold: {item.qty}
                                                </p>
                                            </div>
                        
                                            <p className="text-sm font-semibold text-blue-900">
                                                {formatPrice(item.revenueCents)}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                            <div>
                                <h3 className="text-base font-semibold text-blue-900">
                                    Slot Performance
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    Top-performing tour slots by usage and revenue.
                                </p>
                            </div>
                        
                            <div className="mt-4 space-y-3">
                                {slotStats.length === 0 ? (
                                    <p className="text-sm text-slate-600">
                                        No slot performance data available.
                                    </p>
                                ) : (
                                    [...slotStats]
                                        .sort((a, b) => b.usagePercent - a.usagePercent)
                                        .slice(0, 10).map((slot) => (
                                        <div
                                            key={slot.slotId}
                                            className="rounded-lg border border-slate-200 bg-white/90 p-3"
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        Bookings: {slot.bookingsCount} · Tickets sold: {slot.ticketsSold}
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        Capacity: {slot.capacityTotal} · Usage: {slot.usagePercent}%
                                                    </p>
                                                </div>
                        
                                                <p className="text-sm font-semibold text-blue-900">
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
                            <h2 className="text-lg font-semibold text-blue-900">
                                Slots
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Performance overview for the strongest tour slots.
                            </p>
                        </div>
                
                        <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                            <div>
                                <h3 className="text-base font-semibold text-blue-900">
                                    Slot Usage Chart
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    Top-performing slots ranked by usage percentage.
                                </p>
                            </div>
                
                            <div className="mt-4 h-80">
                                {slotChartData.length === 0 ? (
                                    <p className="text-sm text-slate-600">
                                        No slot chart data available.
                                    </p>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={slotChartData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                type="number"
                                                tickFormatter={(value) => `${value}%`}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="label"
                                                width={180}
                                            />
                                            <Tooltip
                                                formatter={(value) => {
                                                    if (value === undefined) return "N/A";
                                                    return [`${value}%`, "Usage"];
                                                }}
                                            />
                                            <Bar
                                                dataKey="usagePercent"
                                                fill="#1d4ed8"
                                                radius={[0, 6, 6, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                
                        <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                            <div>
                                <h3 className="text-base font-semibold text-blue-900">
                                    Top Slot Performance
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    Detailed performance metrics for the highest-usage slots.
                                </p>
                            </div>
                
                            <div className="mt-4 space-y-3">
                                {topSlotStats.length === 0 ? (
                                    <p className="text-sm text-slate-600">
                                        No slot performance data available.
                                    </p>
                                ) : (
                                    topSlotStats.map((slot) => (
                                        <div
                                            key={slot.slotId}
                                            className="rounded-lg border border-slate-200 bg-white/90 p-3"
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {formatDateTime(slot.startAt)} - {formatDateTime(slot.endAt)}
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        Bookings: {slot.bookingsCount} · Tickets sold: {slot.ticketsSold}
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        Capacity: {slot.capacityTotal} · Usage: {slot.usagePercent}%
                                                    </p>
                                                </div>
                
                                                <p className="text-sm font-semibold text-blue-900">
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
                            <h2 className="text-lg font-semibold text-blue-900">
                                Ticket Types
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Performance overview by ticket type.
                            </p>
                        </div>

                        <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                            <div>
                                <h3 className="text-base font-semibold text-blue-900">
                                    Ticket Type Revenue Chart
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
                                    Revenue comparison across ticket types.
                                </p>
                            </div>
                        
                            <div className="mt-4 h-72">
                                {ticketTypeChartData.length === 0 ? (
                                    <p className="text-sm text-slate-600">
                                        No chart data available.
                                    </p>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={ticketTypeChartData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis tickFormatter={(value) => `£${value}`} />
                                            <Tooltip
                                                formatter={(value) => {
                                                    if (value === undefined) return "N/A";
                                                    return [`£${value}`, "Revenue"];
                                                }}
                                            />
                                            <Bar dataKey="revenue" fill="#1d4ed8" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                
                        {ticketTypeStats.length === 0 ? (
                            <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                                <p className="text-sm text-slate-600">
                                    No ticket type data available.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="rounded-xl bg-white/90 p-5 shadow-sm">
                                    <div>
                                        <h3 className="text-base font-semibold text-blue-900">
                                            Ticket Type Revenue
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Revenue generated by each ticket type.
                                        </p>
                                    </div>
                
                                    <div className="mt-4 space-y-3">
                                        {ticketTypeStats.map((item) => (
                                            <div
                                                key={item.ticketTypeId}
                                                className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white/90 p-3 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {item.ticketTypeName}
                                                    </p>

                                                    {ticketTypeDescriptions[item.ticketTypeName] && (
                                                        <p className="text-sm text-slate-500">
                                                            {ticketTypeDescriptions[item.ticketTypeName]}
                                                        </p>
                                                    )}

                                                    <p className="text-sm text-slate-600">
                                                        Tickets sold: {item.qty}
                                                    </p>
                                                </div>
                
                                                <p className="text-sm font-semibold text-blue-900">
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
                            <h2 className="text-lg font-semibold text-blue-900">
                                Operations
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Run admin maintenance tasks for slots and blackouts.
                            </p>
                        </div>
                
                        {operationsError && (
                            <p className="text-sm text-red-600">
                                {operationsError}
                            </p>
                        )}
                
                        {operationsSuccess && (
                            <p className="text-sm text-green-700">
                                {operationsSuccess}
                            </p>
                        )}
                
                        <div className="rounded-xl bg-white/90 p-5 shadow-sm space-y-4">
                            <div>
                                <h3 className="text-base font-semibold text-blue-900">
                                    Generate Slots
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
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
                                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-700 sm:max-w-xs"
                                />
                
                                <button
                                    type="button"
                                    onClick={handleGenerateSlots}
                                    disabled={isGeneratingSlots}
                                    className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isGeneratingSlots ? "Generating..." : "Generate Slots"}
                                </button>
                            </div>
                        </div>
                
                        <div className="rounded-xl bg-white/90 p-5 shadow-sm space-y-4">
                            <div>
                                <h3 className="text-base font-semibold text-blue-900">
                                    Sync Blackouts
                                </h3>
                                <p className="mt-1 text-sm text-slate-600">
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
                                    className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-700 sm:max-w-xs"
                                />
                
                                <button
                                    type="button"
                                    onClick={handleSyncBlackouts}
                                    disabled={isSyncingBlackouts}
                                    className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
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