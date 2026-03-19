import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";


type RevenueItem = {
    date: string;
    revenueCents: number;
}

function formatCurrency(cents: number) {
    return Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
    }).format(cents / 100);
}

export default function RevenueChart({ data }: { data: RevenueItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">
        Revenue Over Time
      </h3>

      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `£${value / 100}`} />
            <Tooltip
              formatter={(value) =>
                typeof value === 'number' ? formatCurrency(value) : value
              }
            />
            <Line
              type="monotone"
              dataKey="revenueCents"
              stroke="#003399"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}