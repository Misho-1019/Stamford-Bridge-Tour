import { useEffect, useState } from "react";
import type { Slot, SlotsResponse } from "../types/slot";
import type { TicketType } from "../types/ticket";
import { getTicketTypes } from "../api/ticketTypes";
import { getSlots } from "../api/slots";
import { formatPrice } from "../lib/format";

function BookingPage() {
    const [date, setDate] = useState('');
    const [slotsData, setSlotsData] = useState<SlotsResponse | null>(null);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [isLoadingTickets, setIsLoadingTickets] = useState(false);
    const [slotsError, setSlotsError] = useState('');
    const [ticketsError, setTicketsError] = useState('');

    useEffect(() => {
        async function loadTicketTypes() {
            try {
                setIsLoadingTickets(true);
                setTicketsError('');

                const data = await getTicketTypes();
                setTicketTypes(data)
            } catch (error) {
                if (error instanceof Error) {
                    setTicketsError(error.message);
                    return;
                }

                setTicketsError('Failed to load ticket types');
            } finally {
                setIsLoadingTickets(false);
            }
        }

        loadTicketTypes();
    }, [])

    async function handleLoadSlots() {
        if (!date) {
            setSlotsError('Please select a date');
            setSlotsData(null);
            return;
        }

        try {
            setIsLoadingSlots(true);
            setSlotsError('')

            const data = await getSlots(date);
            setSlotsData(data);
        } catch (error) {
            setSlotsData(null);

            if (error instanceof Error) {
                setSlotsError(error.message);
                return;
            }
            
            setSlotsError('Failed to load slots');
        } finally {
            setIsLoadingSlots(false);
        }
    }

    return (
        <section className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold">Booking Page</h1>
                <p className="mt-2 text-sm text-slate-600">
                    For now we are only testing backend connection.
                </p>
            </div>

            <div className="space-y-3">
                <h2 className="text-lg font-semibold">Select Date</h2>

                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        className="rounded border border-slate-300 px-3 py-2"
                    />

                    <button
                        type="button"
                        onClick={handleLoadSlots}
                        className="rounded border border-slate-300 px-4 py-2"
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
                        This date is blocked{slotsData.reason ? `: ${slotsData.reason}` : '.'}
                    </p>
                )}

                {slotsData && !slotsData.blocked && slotsData.slots.length === 0 && (
                    <p className="text-sm text-slate-600">
                        No slots available for this date.
                    </p>
                )}

                {slotsData && !slotsData.blocked && slotsData.slots.length > 0 && (
                    <ul className="space-y-2">
                        {slotsData.slots.map((slot: Slot) => (
                            <li
                                key={slot.id}
                                className="rounded border border-slate-200 p-3"
                            >
                                <p className="font-medium">
                                    {slot.startAt} - {slot.endAt}
                                </p>
                                <p className="text-sm text-slate-600">
                                    Remaining seats: {slot.remainingSeats} / {slot.capacityTotal}
                                </p>
                            </li>
                        ))}
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
                    <ul className="space-y-2">
                        {ticketTypes.map((ticketType) => (
                            <li
                                key={ticketType.id}
                                className="rounded border border-slate-200 p-3"
                            >
                                <p className="font-medium">{ticketType.name}</p>
                                <p className="text-sm text-slate-600">
                                    {formatPrice(ticketType.priceCents)}
                                </p>
                                <p className="text-sm text-slate-600">
                                    Active: {ticketType.isActive ? 'Yes' : 'No'}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    );
}

export default BookingPage;