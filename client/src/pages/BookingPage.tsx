import { useEffect, useState } from "react";
import { getSlots } from "../api/slots";
import { getTicketTypes } from "../api/ticketTypes";
import { formatPrice } from "../lib/format";
import type { Slot, SlotsResponse } from "../types/slot";
import type { TicketType } from "../types/ticket";
import { createHold } from "../api/holds";

function BookingPage() {
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

    const [bookingError, setBookingError] = useState('');
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
    
    async function handleContinueToPayment() {
        if (!selectedSlotId) {
            setBookingError('Please select a slot');
            return;
        }

        if (!email.trim()) {
            setBookingError('Please enter your email');
            return;
        }

        if (selectedItems.length === 0) {
            setBookingError('Please select at least one ticket');
            return;
        }

        try {
            setIsSubmitting(true);
            setBookingError('');

            const response = await createHold({
                slotId: selectedSlotId,
                email: email.trim(),
                items: selectedItems,
            })

            window.location.href = response.checkoutUrl;
        } catch (error) {
            if (error instanceof Error) {
                setBookingError(error.message);
                return;
            }

            setBookingError('Failed to continue to payment');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <section className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold">Booking Page</h1>
                <p className="mt-2 text-sm text-slate-600">
                    For now we are testing the booking flow UI and backend connection.
                </p>
            </div>

            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Select Date</h2>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        className="rounded border border-slate-300 bg-white px-3 py-2"
                    />

                    <button
                        type="button"
                        onClick={handleLoadSlots}
                        className="rounded bg-blue-700 px-4 py-2 font-medium text-white transition hover:bg-blue-800"
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

            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Slots</h2>

                {!slotsData && (
                    <p className="text-sm text-slate-600">
                        No slots loaded yet.
                    </p>
                )}

                {slotsData?.blocked && (
                    <p className="text-sm text-red-600">
                        This date is blocked{slotsData.reason ? `: ${slotsData.reason}` : "."}
                    </p>
                )}

                {slotsData && !slotsData.blocked && slotsData.slots.length === 0 && (
                    <p className="text-sm text-slate-600">
                        No slots available for this date.
                    </p>
                )}

                {slotsData && !slotsData.blocked && slotsData.slots.length > 0 && (
                    <ul className="space-y-2">
                        {slotsData.slots.map((slot: Slot) => {
                            const isSelected = selectedSlotId === slot.id;

                            return (
                                <li
                                    key={slot.id}
                                    onClick={() => setSelectedSlotId(slot.id)}
                                    className={`cursor-pointer rounded border p-3 transition ${
                                        isSelected
                                            ? "border-blue-700 bg-blue-50"
                                            : "border-slate-200 bg-white/90 hover:border-blue-400"
                                    }`}
                                >
                                    <p className="font-medium">
                                        {slot.startAt} - {slot.endAt}
                                    </p>
                                    <p className="text-sm text-slate-600">
                                        Remaining: {slot.remainingSeats} / {slot.capacityTotal}
                                    </p>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Ticket Types</h2>

                {isLoadingTickets && (
                    <p className="text-sm text-slate-600">Loading ticket types...</p>
                )}

                {ticketsError && (
                    <p className="text-sm text-red-600">{ticketsError}</p>
                )}

                {!isLoadingTickets && !ticketsError && ticketTypes.length === 0 && (
                    <p className="text-sm text-slate-600">
                        No ticket types found.
                    </p>
                )}

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
                                        <p className="font-medium">{ticket.name}</p>
                                        <p className="text-sm text-slate-600">
                                            {formatPrice(ticket.priceCents)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setQuantities((prev) => ({
                                                    ...prev,
                                                    [ticket.id]: Math.max(0, qty - 1),
                                                }))
                                            }
                                            className="rounded border border-slate-300 bg-white px-3 py-1"
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
                                            className="rounded border border-slate-300 bg-white px-3 py-1"
                                        >
                                            +
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div className="space-y-2">
                <h2 className="text-lg font-semibold">Your Email</h2>

                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded border border-slate-300 bg-white px-3 py-2"
                />
            </div>

            <div className="space-y-3 rounded border border-slate-200 bg-white/90 p-4">
                <h2 className="text-lg font-semibold">Booking Summary</h2>

                <p className="text-sm text-slate-600">
                    Selected slot: {selectedSlotId ? "Chosen" : "Not selected"}
                </p>

                <p className="text-lg font-semibold">
                    Total: {formatPrice(totalCents)}
                </p>

                {bookingError && (
                    <p className="text-sm text-red-600">{bookingError}</p>
                )}

                <button
                    type="button"
                    onClick={handleContinueToPayment}
                    disabled={!selectedSlotId || totalCents === 0 || !email || isSubmitting}
                    className="w-full rounded bg-blue-700 px-4 py-3 font-medium text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? "Redirecting..." : "Continue to Payment"}
                </button>
            </div>
        </section>
    );
}

export default BookingPage;