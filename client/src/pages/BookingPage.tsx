import { useEffect, useState } from "react";
import { getSlots } from "../api/slots";
import { getTicketTypes } from "../api/ticketTypes";
import { formatDateTime, formatPrice } from "../lib/format";
import type { Slot, SlotsResponse } from "../types/slot";
import type { TicketType } from "../types/ticket";
import { createHold } from "../api/holds";
import { useClientAuth } from "../context/ClientAuthContext";
import { useNavigate } from "react-router";

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

    const selectedSlot = slotsData?.slots.find(
        (slot) => slot.id === selectedSlotId
    );

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-blue-900">
                    Book Your Stamford Bridge Tour
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                    Choose your preferred date, time, and tickets.
                </p>
            </div>

            {/* Date */}
            <div className="rounded-xl bg-white/90 p-5 shadow-sm space-y-3">
                <h2 className="text-lg font-semibold text-blue-900">
                    Select Date
                </h2>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="rounded border border-slate-300 bg-white px-3 py-2"
                    />

                    <button
                        type="button"
                        onClick={handleLoadSlots}
                        className="rounded-lg bg-blue-700 px-4 py-2 font-medium text-white transition hover:bg-blue-800"
                    >
                        Load Slots
                    </button>
                </div>

                {isLoadingSlots && (
                    <p className="text-sm text-slate-600">Loading slots...</p>
                )}

                {slotsError && (
                    <p className="text-sm text-red-600">{slotsError}</p>
                )}
            </div>

            {/* Slots */}
            <div className="rounded-xl bg-white/90 p-5 shadow-sm space-y-3">
                <h2 className="text-lg font-semibold text-blue-900">
                    Available Slots
                </h2>

                {!slotsData && (
                    <p className="text-sm text-slate-600">
                        No slots loaded yet.
                    </p>
                )}

                {slotsData?.blocked && (
                    <p className="text-sm text-red-600">
                        This date is blocked
                        {slotsData.reason ? `: ${slotsData.reason}` : "."}
                    </p>
                )}

                {slotsData &&
                    !slotsData.blocked &&
                    slotsData.slots.length > 0 && (
                        <ul className="space-y-2">
                            {slotsData.slots.map((slot: Slot) => {
                                const isSelected =
                                    selectedSlotId === slot.id;
                                const isFull =
                                    slot.remainingSeats === 0;

                                return (
                                    <li
                                        key={slot.id}
                                        onClick={() => {
                                            if (!isFull) {
                                                setSelectedSlotId(slot.id);
                                            }
                                        }}
                                        className={`rounded border p-3 transition ${
                                            isFull
                                                ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                                                : isSelected
                                                ? "cursor-pointer border-blue-700 bg-blue-100"
                                                : "cursor-pointer border-slate-200 bg-white/90 hover:border-blue-400"
                                        }`}
                                    >
                                        <p className="font-medium">
                                            {formatDateTime(slot.startAt)} -{" "}
                                            {formatDateTime(slot.endAt)}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            Remaining: {slot.remainingSeats} /{" "}
                                            {slot.capacityTotal}
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    )
                }
                
                {slotsData && !slotsData.blocked && slotsData.slots.length > 0 && !selectedSlotId && (
                    <p className="text-sm text-amber-700">
                        Please select one available slot to continue.
                    </p>
                )}
            </div>

            {/* Tickets */}
            <div className="rounded-xl bg-white/90 p-5 shadow-sm space-y-3">
                <h2 className="text-lg font-semibold text-blue-900">
                    Ticket Types
                </h2>

                {ticketTypes.length > 0 && (
                    <ul className="space-y-3">
                        {ticketTypes.map((ticket) => {
                            const qty = quantities[ticket.id] || 0;

                            return (
                                <li
                                    key={ticket.id}
                                    className="flex items-center justify-between rounded border border-slate-200 bg-white/90 p-3"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {ticket.name}
                                        </p>
                                        <p className="text-sm text-slate-600">
                                            {formatPrice(
                                                ticket.priceCents
                                            )}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
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
                                            className="rounded bg-slate-100 px-3 py-1 hover:bg-slate-200"
                                        >
                                            -
                                        </button>

                                        <span className="w-8 text-center font-medium">
                                            {qty}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuantities((prev) => ({
                                                    ...prev,
                                                    [ticket.id]: qty + 1,
                                                }))
                                            }
                                            className="rounded bg-slate-100 px-3 py-1 hover:bg-slate-200"
                                        >
                                            +
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {ticketTypes.length > 0 && totalTickets === 0 && (
                    <p className="text-sm text-amber-700">
                        Please choose at least one ticket.
                    </p>
                )}
            </div>

            {/* Email */}
            <div className="rounded-xl bg-white/90 p-5 shadow-sm space-y-2">
                <h2 className="text-lg font-semibold text-blue-900">
                    Your Email
                </h2>

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    readOnly={isAuthenticated}
                    className={`w-full rounded border px-3 py-2 ${
                        isAuthenticated
                            ? "border-slate-200 bg-slate-100 text-slate-600"
                            : "border-slate-300 bg-white text-slate-900"
                    }`}
                />

                {isAuthenticated && client?.email && (
                    <p className="text-sm text-slate-600">
                        This email is linked to your account and will be used for the booking.
                    </p>
                )}

                {email && !email.includes("@") && (
                    <p className="text-sm text-red-600">
                        Please enter a valid email address
                    </p>
                )}
            </div>

            {/* Summary */}
            <div className="rounded-xl bg-white/95 p-5 shadow-md space-y-3">
                <h2 className="text-lg font-semibold text-blue-900">
                    Booking Summary
                </h2>

                <div className="space-y-2 text-sm text-slate-600">
                    <p>
                        Selected slot:{" "}
                        <span className="font-medium text-slate-900">
                            {selectedSlot
                                ? `${formatDateTime(selectedSlot.startAt)} - ${formatDateTime(selectedSlot.endAt)}`
                                : "Not selected"}
                        </span>
                    </p>
                
                    <p>
                        Tickets selected:{" "}
                        <span className="font-medium text-slate-900">
                            {totalTickets}
                        </span>
                    </p>
                
                    <p>
                        Booking email:{" "}
                        <span className="font-medium text-slate-900">
                            {bookingEmail || "Not provided"}
                        </span>
                    </p>
                </div>

                <p className="text-lg font-semibold">
                    Total: {formatPrice(totalCents)}
                </p>

                {bookingError && (
                    <p className="text-sm text-red-600">
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
                    className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting
                        ? "Redirecting..."
                        : "Continue to Payment"}
                </button>

                {!selectedSlotId || totalTickets === 0 || !bookingEmail ? (
                    <p className="text-center text-sm text-slate-500">
                        Complete all booking details to continue to payment.
                    </p>
                ) : null}

                {!isAuthenticated && (
                    <p className="text-sm text-red-600 text-center">
                        Please log in to complete your booking.
                    </p>
                )}
            </div>
        </section>
    );
}

export default BookingPage;