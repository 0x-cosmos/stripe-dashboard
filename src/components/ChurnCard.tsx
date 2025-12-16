"use client";

import { ChurnData } from "@/lib/stripe/types";
import { TrendingDown } from "lucide-react";

interface ChurnCardProps {
  data: ChurnData
}

export default function ChurnCard({ data }: ChurnCardProps) {
  // Mock trend or calculation
  const trend = -2.5; // Placeholder for negative trend (which is good for churn, but bad if it's high)
  // Actually, churn increasing is bad. So let's assume this is "Churn Rate" change.

  return (
    <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-[var(--muted)] uppercase tracking-wider">MRR at Risk</h2>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--danger)]/10 text-[var(--danger)] text-xs font-medium">
          <TrendingDown className="w-3 h-3" />
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-3xl font-bold text-[var(--foreground)] tracking-tight">
          ${parseFloat(data.mrrAtRisk.toFixed(2)).toLocaleString()}
        </span>
        <span className="text-sm text-[var(--muted)] font-medium">USD</span>
      </div>

      <p className="text-sm text-[var(--muted)] mb-6">
        Potential loss from <span className="text-[var(--foreground)] font-medium">upcoming invoices</span>
      </p>

      {
        data.planBreakdown && (
          <div className="space-y-3 pt-6 border-t border-[var(--border)]">
            <h3 className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">Risk Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(data.planBreakdown).map(([planName, amount]) => (
                <div key={planName} className="flex items-center justify-between text-sm group cursor-default">
                  <span className="text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors">{planName}</span>
                  <span className="font-medium text-[var(--danger)]">${parseFloat(amount.toFixed(2)).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )
      }
    </div >
  );
}
