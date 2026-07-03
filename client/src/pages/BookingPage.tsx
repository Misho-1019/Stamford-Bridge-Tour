import { useEffect, useMemo, useState } from "react";
import { getSlots } from "../api/slots";
import { getTicketTypes } from "../api/ticketTypes";
import { formatPrice } from "../lib/format";
import type { Slot, SlotsResponse } from "../types/slot";
import type { TicketType } from "../types/ticket";
import { createHold } from "../api/holds";
import { joinWaitlist } from "../api/waitlist";
import { useClientAuth } from "../context/ClientAuthContext";
import { useNavigate } from "react-router";
import { SkeletonCard } from "../components/Skeleton";

function BookingPage() {
    const { isAuthenticated, client } = useClientAuth();
    const navigate = useNavigate();

    const [date, setDate] = useState("");
    const [slotsData, setSlotsData] = useState<SlotsResponse | null>(null);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isLoadingTickets, setIsLoadingTickets] = useState(false);
    const [slotsError, setSlotsError] = useState("");
    const [ticketsError, setTicketsError] = useState("");

    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [quantities, setQuantities] = useState<Record<string, number>>({});

    const [bookingError, setBookingError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [waitlistSlotId, setWaitlistSlotId] = useState<string | null>(null);
    const [waitlistEmail, setWaitlistEmail] = useState("");
    const [waitlistMessage, setWaitlistMessage] = useState("");
    const [waitlistError, setWaitlistError] = useState("");
    const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);

    useEffect(() => {
        async function loadTicketTypes() {
            try {
                setIsLoadingTickets(true);
                setTicketsError("");

                const data = await getTicketTypes();
                setTicketTypes(data);
            } catch (error) {
                if (error instanceof Error) {
                    setTicketsError(error.message);
                    return;
                }

                setTicketsError("Failed to load ticket types");
            } finally {
                setIsLoadingTickets(false);
            }
        }

        loadTicketTypes();
    }, []);

    useEffect(() => {
        if (client?.email) {
            setEmail(client.email)
        }

    }, [client])

    async function handleLoadSlots() {
        if (!date) {
            setSlotsError("Please select a date");
            setSlotsData(null);
            setSelectedSlotId(null);
            return;
        }

        try {
            setIsLoadingSlots(true);
            setSlotsError("");
            setSelectedSlotId(null);

            const data = await getSlots(date);
            setSlotsData(data);
        } catch (error) {
            setSlotsData(null);
            setSelectedSlotId(null);

            if (error instanceof Error) {
                setSlotsError(error.message);
                return;
            }

            setSlotsError("Failed to load slots");
        } finally {
            setIsLoadingSlots(false);
        }
    }

    const totalCents = ticketTypes.reduce((sum, ticket) => {
        const qty = quantities[ticket.id] || 0;
        return sum + qty * ticket.priceCents;
    }, 0);

    const selectedItems = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([ticketTypeId, qty]) => ({
            ticketTypeId,
            qty,
        }));
    
    const totalTickets = selectedItems.reduce((sum, item) => sum + item.qty, 0);

    const bookingEmail = isAuthenticated && client?.email ? client.email : email.trim();

    async function handleContinueToPayment() {
        if (!isAuthenticated) {
            navigate('/login', {
                state: { from: { pathname: '/book' } },
            })

            return;
        }

        if (!selectedSlotId) {
            setBookingError("Please select a slot");
            return;
        }

        if (!bookingEmail) {
            setBookingError("Please enter your email");
            return;
        }

        if (selectedItems.length === 0) {
            setBookingError("Please select at least one ticket");
            return;
        }

        try {
            setIsSubmitting(true);
            setBookingError("");

            const response = await createHold({
                slotId: selectedSlotId,
                email: bookingEmail,
                items: selectedItems,
            });

            window.location.href = response.checkoutUrl;
        } catch (error) {
            if (error instanceof Error) {
                setBookingError(error.message);
                return;
            }

            setBookingError("Failed to continue to payment");
        } finally {
            setIsSubmitting(false);
        }
    }

    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    async function handleJoinWaitlist(slotId: string) {
        const emailToUse = isAuthenticated && client?.email ? client.email : waitlistEmail.trim();

        if (!emailToUse) {
            setWaitlistError("Please enter your email to join the waitlist");
            return;
        }

        if (!EMAIL_REGEX.test(emailToUse)) {
            setWaitlistError("Please enter a valid email address");
            return;
        }

        try {
            setIsJoiningWaitlist(true);
            setWaitlistError("");
            setWaitlistMessage("");

            const response = await joinWaitlist(slotId, emailToUse);
            setWaitlistMessage(response.message);
            setWaitlistSlotId(null);
        } catch (error) {
            if (error instanceof Error) {
                setWaitlistError(error.message);
            } else {
                setWaitlistError("Failed to join waitlist");
            }
        } finally {
            setIsJoiningWaitlist(false);
        }
    }

    const steps = useMemo(() => {
        const stepMap = {
            date: 1,
            slot: selectedSlotId ? 2 : null,
            tickets: totalTickets > 0 ? 3 : null,
            email: bookingEmail ? 4 : null,
        };
        const completed = Object.values(stepMap).filter(Boolean).length;
        return { current: completed + 1, total: 4 };
    }, [selectedSlotId, totalTickets, bookingEmail]);

    const selectedSlot = slotsData?.slots.find(
        (slot) => slot.id === selectedSlotId
    );

    const ticketBreakdown = useMemo(() => {
        return ticketTypes
            .filter((t) => (quantities[t.id] || 0) > 0)
            .map((t) => ({
                name: t.name,
                qty: quantities[t.id],
                unitPrice: t.priceCents,
                total: quantities[t.id] * t.priceCents,
            }));
    }, [ticketTypes, quantities]);

    return (
        <section className="flex flex-col gap-5 lg:flex-row lg:gap-[22px]" style={{ color: 'rgba(255,255,255,0.60)' }}>
            {/* Left Column — ~68% */}
            <div className="flex-1 space-y-5 pb-24 lg:pb-0">
                {/* Header */}
                <div className="space-y-1.5">
                    <h1 className="text-[28px] font-bold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                        Book Your Stamford Bridge Tour
                    </h1>
                    <p className="text-[15px]" style={{ color: 'rgba(255,255,255,0.60)' }}>
                        Choose your preferred date, time and tickets.
                    </p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-1 text-xs sm:gap-2 sm:text-sm">
                    {["Select Date", "Choose Slot", "Pick Tickets", "Confirm"].map((label, i) => {
                        const stepNum = i + 1;
                        const isActive = stepNum === steps.current;
                        const isDone = stepNum < steps.current;
                        return (
                            <div key={label} className="flex items-center gap-1 sm:gap-2">
                                <div
                                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition-all sm:h-7 sm:w-7 sm:text-xs ${
                                        isDone || isActive
                                            ? "text-white"
                                            : "text-white/60"
                                    }`}
                                    style={{
                                        background: isDone || isActive ? '#D4AF37' : 'rgba(255,255,255,0.08)',
                                        border: isDone || isActive ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.15)',
                                        boxShadow: isActive ? '0 0 16px rgba(212,175,55,0.3)' : 'none'
                                    }}
                                >
                                    {isDone ? "✓" : stepNum}
                                </div>
                                <span
                                    className={`whitespace-nowrap ${
                                        isActive || isDone
                                            ? 'font-semibold'
                                            : ''
                                    }`}
                                    style={{
                                        color: isActive || isDone ? 'rgba(255,255,255,0.90)' : 'rgba(255,255,255,0.40)'
                                    }}
                                >
                                    {label}
                                </span>
                                {i < 3 && <span style={{ color: 'rgba(255,255,255,0.25)' }}>→</span>}
                            </div>
                        );
                    })}
                </div>

                {/* Date Selection */}
                <div className="glass-card p-[22px] transition-all duration-500 hover:border-[rgba(212,175,55,0.12)]">
                    <h2 className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                        Select Date
                    </h2>

                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                        <div className="flex-1">
                            <label htmlFor="booking-date" className="mb-2 block text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>SELECT DATE</label>
                            <input
                                id="booking-date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full rounded-xl border px-[14px] py-[12px] text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.10)',
                                    background: 'rgba(255,255,255,0.06)',
                                    backdropFilter: 'blur(8px)',
                                    color: 'rgba(255,255,255,0.90)'
                                }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleLoadSlots}
                            className="inline-flex items-center justify-center rounded-xl border px-8 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                            style={{
                                borderColor: 'rgba(212,175,55,0.3)',
                                background: 'rgba(212,175,55,0.08)',
                                backdropFilter: 'blur(12px)',
                                color: '#D4AF37'
                            }}
                        >
                            Load Slots
                        </button>
                    </div>

                    {isLoadingSlots && (
                        <div className="mt-3 space-y-3">
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    )}

                    {slotsError && (
                        <p className="mt-2 text-sm" style={{ color: '#EF4444' }}>{slotsError}</p>
                    )}
                </div>

                {/* Available Slots */}
                <div className="glass-card p-[22px] transition-all duration-500 hover:border-[rgba(212,175,55,0.12)]">
                    <h2 className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                        Available Slots
                    </h2>

                    <div className="mt-3">
                        {!slotsData && (
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                                No slots loaded yet.
                            </p>
                        )}

                        {slotsData?.blocked && (
                            <p className="text-sm" style={{ color: '#EF4444' }}>
                                This date is blocked
                                {slotsData.reason ? `: ${slotsData.reason}` : "."}
                            </p>
                        )}

                        {slotsData && !slotsData.blocked && slotsData.slots.length === 0 && (
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                No available slots for this date. Please select another date.
                            </p>
                        )}

                        {slotsData &&
                            !slotsData.blocked &&
                            slotsData.slots.length > 0 && (
                                <div className="flex flex-wrap gap-3">
                                    {slotsData.slots.map((slot: Slot) => {
                                        const isSelected =
                                            selectedSlotId === slot.id;
                                        const isFull =
                                            slot.remainingSeats === 0;

                                        return (
                                            <div
                                                key={slot.id}
                                                onClick={() => {
                                                    if (!isFull) {
                                                        setSelectedSlotId(slot.id);
                                                    }
                                                }}
                                                className={`flex cursor-pointer flex-col items-center gap-0.5 rounded-full border px-5 py-2.5 text-center transition-all duration-300 ${
                                                    isFull
                                                        ? 'cursor-default opacity-40'
                                                        : 'hover:-translate-y-0.5'
                                                }`}
                                                style={{
                                                    borderColor: isSelected
                                                        ? 'rgba(212,175,55,0.4)'
                                                        : 'rgba(255,255,255,0.10)',
                                                    background: isSelected
                                                        ? 'rgba(212,175,55,0.1)'
                                                        : isFull
                                                        ? 'rgba(255,255,255,0.03)'
                                                        : 'rgba(255,255,255,0.06)',
                                                    backdropFilter: 'blur(8px)',
                                                    boxShadow: isSelected ? '0 0 20px rgba(212,175,55,0.15)' : 'none'
                                                }}
                                            >
                                                <span className="text-sm font-semibold" style={{ color: isFull ? 'rgba(255,255,255,0.40)' : isSelected ? '#D4AF37' : 'rgba(255,255,255,0.90)' }}>
                                                    {isSelected && !isFull && (
                                                        <span className="mr-1">✓</span>
                                                    )}
                                                    {new Date(slot.startAt).toLocaleTimeString("en-US", {
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                    })}
                                                </span>
                                                <span className="text-[11px] font-mono-custom" style={{
                                                    color: isFull
                                                        ? 'rgba(255,255,255,0.30)'
                                                        : isSelected
                                                        ? 'rgba(212,175,55,0.7)'
                                                        : 'rgba(255,255,255,0.45)'
                                                }}>
                                                    {isFull ? "Sold Out" : `${slot.remainingSeats} left`}
                                                </span>
                                                {isFull && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setWaitlistSlotId(slot.id);
                                                            setWaitlistEmail(client?.email || "");
                                                        }}
                                                        className="mt-1 rounded-full border px-3 py-0.5 text-[10px] font-medium transition-all hover:bg-white/10"
                                                        style={{
                                                            borderColor: 'rgba(212,175,55,0.3)',
                                                            color: '#D4AF37'
                                                        }}
                                                    >
                                                        Join Waitlist
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )
                        }

                        {slotsData && !slotsData.blocked && slotsData.slots.length > 0 && !selectedSlotId && (
                            <p className="mt-2 text-sm" style={{ color: 'rgba(212,175,55,0.7)' }}>
                                Please select one available slot to continue.
                            </p>
                        )}
                    </div>
                </div>

                {/* Ticket Types */}
                <div className="glass-card p-[22px] transition-all duration-500 hover:border-[rgba(212,175,55,0.12)]">
                    <h2 className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                        Ticket Types
                    </h2>

                    <div className="mt-3">
                        {isLoadingTickets && (
                            <div className="space-y-3">
                                <SkeletonCard />
                                <SkeletonCard />
                                <SkeletonCard />
                            </div>
                        )}

                        {ticketsError && (
                            <p className="text-sm" style={{ color: '#EF4444' }}>{ticketsError}</p>
                        )}

                        {!isLoadingTickets && !ticketsError && ticketTypes.length === 0 && (
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>No ticket types available.</p>
                        )}

                        {ticketTypes.length > 0 && (
                            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                                {ticketTypes.map((ticket) => {
                                    const qty = quantities[ticket.id] || 0;

                                    return (
                                        <div
                                            key={ticket.id}
                                            className="flex flex-col rounded-xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(212,175,55,0.25)]"
                                            style={{
                                                background: 'rgba(255,255,255,0.04)',
                                                backdropFilter: 'blur(8px)',
                                                border: '1px solid rgba(255,255,255,0.06)'
                                            }}
                                        >
                                            <div className="flex-1 space-y-1">
                                                <p className="text-[20px] font-bold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                                    {ticket.name}
                                                </p>
                                                <p className="text-[18px] font-bold font-mono-custom" style={{ color: '#D4AF37' }}>
                                                    {formatPrice(ticket.priceCents)}
                                                </p>
                                            </div>

                                            <div className="mt-4 flex items-center justify-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setQuantities((prev) => ({
                                                            ...prev,
                                                            [ticket.id]: Math.max(
                                                                0,
                                                                qty - 1
                                                            ),
                                                        }))
                                                    }
                                                    className="flex h-[42px] w-[42px] items-center justify-center rounded-lg text-lg font-bold text-white transition-all hover:scale-105 active:scale-95"
                                                    style={{
                                                        background: 'rgba(212,175,55,0.15)',
                                                        border: '1px solid rgba(212,175,55,0.25)',
                                                        color: '#D4AF37'
                                                    }}
                                                >
                                                    −
                                                </button>

                                                <span className="flex h-[42px] w-[42px] items-center justify-center rounded-lg font-bold font-mono-custom text-[24px]"
                                                    style={{
                                                        background: 'rgba(255,255,255,0.06)',
                                                        border: '1px solid rgba(255,255,255,0.08)',
                                                        color: 'rgba(255,255,255,0.90)'
                                                    }}>
                                                    {qty}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setQuantities((prev) => ({
                                                            ...prev,
                                                            [ticket.id]: Math.min(10, qty + 1),
                                                        }))
                                                    }
                                                    disabled={qty >= 10}
                                                    className="flex h-[42px] w-[42px] items-center justify-center rounded-lg text-lg font-bold text-white transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                                                    style={{
                                                        background: 'rgba(212,175,55,0.15)',
                                                        border: '1px solid rgba(212,175,55,0.25)',
                                                        color: '#D4AF37'
                                                    }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {ticketTypes.length > 0 && totalTickets === 0 && (
                            <p className="mt-2 text-sm" style={{ color: 'rgba(212,175,55,0.7)' }}>
                                Please choose at least one ticket.
                            </p>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="glass-card p-[22px] transition-all duration-500 hover:border-[rgba(212,175,55,0.12)]">
                    <h2 className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                        Your Email
                    </h2>

                    <div className="mt-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            readOnly={isAuthenticated}
                            className="w-full rounded-xl border px-[14px] py-[12px] text-sm transition-all duration-200 focus:outline-none focus:ring-2 placeholder"
                            style={{
                                borderColor: isAuthenticated ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)',
                                background: isAuthenticated ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                                backdropFilter: 'blur(8px)',
                                color: isAuthenticated ? 'rgba(255,255,255,0.40)' : 'rgba(255,255,255,0.90)'
                            }}
                        />
                    </div>

                    {isAuthenticated && client?.email && (
                        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                            This email is linked to your account and will be used for the booking.
                        </p>
                    )}

                    {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                        <p className="mt-1 text-sm" style={{ color: '#EF4444' }}>
                            Please enter a valid email address
                        </p>
                    )}
                </div>
            </div>

            {/* Right Column — Booking Summary ~28% */}
            <div className="lg:w-[30%] lg:min-w-[260px] lg:shrink-0">
                <div className="sticky top-6">
                    <div className="glass-card p-5" style={{ borderLeft: '4px solid #D4AF37' }}>
                        <h2 className="text-[18px] font-bold" style={{ color: '#D4AF37' }}>
                            Tour Summary
                        </h2>

                        <div className="mt-4 space-y-3 text-sm">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                    Selected Date
                                </p>
                                <p className="mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                    {date
                                        ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          })
                                        : "Not selected"}
                                </p>
                                {selectedSlot && (
                                    <p className="mt-0.5 text-sm font-mono-custom" style={{ color: '#D4AF37' }}>
                                        {new Date(selectedSlot.startAt).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                )}
                            </div>

                            <div className="border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                    Tickets
                                </p>
                                {ticketBreakdown.length > 0 ? (
                                    <div className="mt-2 space-y-1">
                                        {ticketBreakdown.map((item) => (
                                            <div key={item.name} className="flex items-center justify-between text-sm">
                                                <span style={{ color: 'rgba(255,255,255,0.70)' }}>
                                                    {item.qty}x {item.name}{item.qty > 1 ? "s" : ""}
                                                </span>
                                                <span className="font-mono-custom" style={{ color: 'rgba(255,255,255,0.90)' }}>{formatPrice(item.total)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-1 font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>None selected</p>
                                )}
                            </div>

                            <div className="border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                    Booking Email
                                </p>
                                <p className="mt-1 break-all font-medium" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                    {bookingEmail || "Not provided"}
                                </p>
                            </div>

                            <div className="border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                    Order Total
                                </p>
                                <div className="mt-2 rounded-xl p-4 text-center" style={{
                                    background: 'rgba(212,175,55,0.06)',
                                    border: '1px solid rgba(212,175,55,0.15)'
                                }}>
                                    <p className="text-[30px] font-extrabold font-mono-custom" style={{ color: '#D4AF37' }}>
                                        {formatPrice(totalCents)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {bookingError && (
                            <p className="mt-3 rounded-lg px-3 py-2 text-sm" style={{
                                background: 'rgba(239,68,68,0.1)',
                                border: '1px solid rgba(239,68,68,0.2)',
                                color: '#EF4444'
                            }}>
                                {bookingError}
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={handleContinueToPayment}
                            disabled={
                                !selectedSlotId ||
                                totalTickets === 0 ||
                                !bookingEmail ||
                                isSubmitting
                            }
                            className="group relative mt-4 w-full overflow-hidden rounded-xl px-4 py-4 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                            style={{
                                border: '1px solid rgba(212,175,55,0.35)',
                                background: 'rgba(212,175,55,0.12)',
                                backdropFilter: 'blur(12px)',
                                color: '#D4AF37'
                            }}
                        >
                            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 gold-shimmer" />
                            <span className="relative z-10">{isSubmitting ? "Redirecting..." : "Proceed to Checkout"}</span>
                        </button>

                        <p className="mt-3 text-center text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Free cancellation up to 24h before tour.
                        </p>

                        {!isAuthenticated && (
                            <p className="mt-2 text-center text-xs" style={{ color: 'rgba(212,175,55,0.6)' }}>
                                Please log in to complete your booking.
                            </p>
                        )}

                        {!selectedSlotId || totalTickets === 0 || !bookingEmail ? (
                            <p className="mt-2 text-center text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                Complete all booking details to continue.
                            </p>
                        ) : null}
                    </div>

                    {/* Secondary Info Card */}
                    <div className="glass-card mt-4 p-5">
                        <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.80)' }}>Official Booking</p>
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Direct from Stamford Bridge</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-50 border-t px-4 py-3 backdrop-blur-2xl lg:hidden" style={{
                borderColor: 'rgba(255,255,255,0.08)',
                background: 'rgba(10,14,26,0.85)'
            }}>
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>Total</p>
                        <p className="text-lg font-bold font-mono-custom" style={{ color: '#D4AF37' }}>
                            {formatPrice(totalCents)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleContinueToPayment}
                        disabled={
                            !selectedSlotId ||
                            totalTickets === 0 ||
                            !bookingEmail ||
                            isSubmitting
                        }
                        className="group relative rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{
                            border: '1px solid rgba(212,175,55,0.35)',
                            background: 'rgba(212,175,55,0.12)',
                            backdropFilter: 'blur(12px)',
                            color: '#D4AF37'
                        }}
                    >
                        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 gold-shimmer" />
                        <span className="relative z-10">{isSubmitting ? "Redirecting..." : "Continue to Payment"}</span>
                    </button>
                </div>
            </div>

            {/* Waitlist Modal */}
            {waitlistSlotId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{
                    background: 'rgba(5,12,28,0.7)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <div className="w-full max-w-md glass-card p-6">
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                                Join Waitlist
                            </h2>
                            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.60)' }}>
                                This slot is currently full. Join the waitlist and we'll notify you if a spot opens up.
                            </p>
                        </div>

                        <div className="mt-4 space-y-3">
                            {!isAuthenticated && (
                                <div>
                                    <label htmlFor="waitlist-email" className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.70)' }}>
                                        Your Email
                                    </label>
                                    <input
                                        id="waitlist-email"
                                        type="email"
                                        value={waitlistEmail}
                                        onChange={(e) => setWaitlistEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="mt-1 w-full rounded-xl border px-[14px] py-[12px] text-sm transition-all duration-200 focus:outline-none"
                                        style={{
                                            borderColor: 'rgba(255,255,255,0.10)',
                                            background: 'rgba(255,255,255,0.06)',
                                            backdropFilter: 'blur(8px)',
                                            color: 'rgba(255,255,255,0.90)'
                                        }}
                                    />
                                </div>
                            )}

                            {waitlistMessage && (
                                <p className="rounded-lg px-3 py-2 text-sm" style={{
                                    background: 'rgba(34,197,94,0.1)',
                                    border: '1px solid rgba(34,197,94,0.2)',
                                    color: '#22C55E'
                                }}>{waitlistMessage}</p>
                            )}

                            {waitlistError && (
                                <p className="rounded-lg px-3 py-2 text-sm" style={{
                                    background: 'rgba(239,68,68,0.1)',
                                    border: '1px solid rgba(239,68,68,0.2)',
                                    color: '#EF4444'
                                }}>{waitlistError}</p>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setWaitlistSlotId(null);
                                        setWaitlistMessage("");
                                        setWaitlistError("");
                                    }}
                                    className="rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:bg-white/10"
                                    style={{
                                        borderColor: 'rgba(255,255,255,0.15)',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'rgba(255,255,255,0.70)'
                                    }}
                                >
                                    Close
                                </button>

                                {!waitlistMessage && (
                                    <button
                                        type="button"
                                        onClick={() => handleJoinWaitlist(waitlistSlotId)}
                                        disabled={isJoiningWaitlist}
                                        className="group relative rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-40"
                                        style={{
                                            border: '1px solid rgba(212,175,55,0.35)',
                                            background: 'rgba(212,175,55,0.12)',
                                            backdropFilter: 'blur(12px)',
                                            color: '#D4AF37'
                                        }}
                                    >
                                        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 gold-shimmer" />
                                        <span className="relative z-10">{isJoiningWaitlist ? "Joining..." : "Join Waitlist"}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default BookingPage;