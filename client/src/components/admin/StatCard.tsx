import Card from "./Card";

type StatCardProps = {
    label: string;
    value: string | number;
};

function StatCard({ label, value }: StatCardProps) {
    return (
        <Card className="flex h-full flex-col justify-center text-center !p-6">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#003399]">{value}</p>
        </Card>
    )
}

export default StatCard;