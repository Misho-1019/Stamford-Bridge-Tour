
type SlotStatsItem = {
    slotId: string;
    startAt: string;
    capacityTotal: number;
    bookingsCount: number;
    ticketsSold: number;
    revenueCents: number;
    usagePercent: number;
};

function formatCurrency(cents: number) {
    return Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(cents / 100);
}

function formatDate(dateString: string) {
    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(dateString))
}

export default function SlotStatsTable({
  data,
}: {
  data: SlotStatsItem[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        Slot Performance
      </h3>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="pb-3 pr-4 font-medium text-slate-600">Slot</th>
              <th className="pb-3 pr-4 font-medium text-slate-600">Capacity</th>
              <th className="pb-3 pr-4 font-medium text-slate-600">Bookings</th>
              <th className="pb-3 pr-4 font-medium text-slate-600">Tickets</th>
              <th className="pb-3 pr-4 font-medium text-slate-600">Revenue</th>
              <th className="pb-3 pr-4 font-medium text-slate-600">Usage</th>
            </tr>
          </thead>

          <tbody>
            {data.map((slot) => (
              <tr key={slot.slotId} className="border-b border-slate-100">
                <td className="py-3 pr-4 text-slate-900">
                  {formatDate(slot.startAt)}
                </td>
                <td className="py-3 pr-4 text-slate-700">
                  {slot.capacityTotal}
                </td>
                <td className="py-3 pr-4 text-slate-700">
                  {slot.bookingsCount}
                </td>
                <td className="py-3 pr-4 text-slate-700">
                  {slot.ticketsSold}
                </td>
                <td className="py-3 pr-4 text-slate-700">
                  {formatCurrency(slot.revenueCents)}
                </td>
                <td className="py-3 pr-4 text-slate-700">
                  {slot.usagePercent}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}