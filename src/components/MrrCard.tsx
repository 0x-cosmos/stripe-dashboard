import { RevenueData } from "@/lib/stripe/types";
import { TrendingUp } from "lucide-react";

export default function MrrCard({ data }: { data: RevenueData }) {
    // Mock trend for now as it's not in the data yet, or calculate if possible.
    // Assuming positive trend for demo purposes or we can omit it.
    const trend = 12; // Placeholder

    return (
        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">Total MRR</h2>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--success)]/10 text-[var(--success)] text-xs font-medium">
                    <TrendingUp className="w-3 h-3" />
                    <span>{trend}%</span>
                </div>
            </div>

            <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
                    ${parseFloat(data.totalMRR.toFixed(2)).toLocaleString()}
                </span>
                <span className="text-sm text-[var(--muted)] font-medium">USD</span>
            </div>

            <p className="text-sm text-[var(--muted)] mb-6">
                Active across <span className="text-[var(--foreground)] font-medium">{data.uniqueUsersCount}</span> consumers
            </p>

            {data.planBreakdown && (
                <div className="space-y-3 pt-6 border-t border-[var(--border)]">
                    <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Breakdown by Plan</h3>
                    <div className="space-y-2">
                        {Object.entries(data.planBreakdown).map(([planName, amount]) => (
                            <div key={planName} className="flex items-center justify-between text-sm group cursor-default">
                                <span className="text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">{planName}</span>
                                <span className="font-medium text-[var(--foreground)]">${parseFloat(amount.toFixed(2)).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}