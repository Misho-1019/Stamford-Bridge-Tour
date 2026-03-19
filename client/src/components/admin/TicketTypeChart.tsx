import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Item = {
    ticketTypeName: string;
    revenueCents: number;
}

function formatCurrency(cents: number) {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(cents / 100)
}

export default function TicketTypeChart({ data }: { data: Item[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        Revenue by Ticket Type
      </h3>

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="ticketTypeName" />
            <YAxis tickFormatter={(v) => `£${v / 100}`} />
            <Tooltip formatter={(value) =>
                typeof value === 'number' ? formatCurrency(value) : value
              }
            />
            <Bar dataKey="revenueCents" fill="#FFD617" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}