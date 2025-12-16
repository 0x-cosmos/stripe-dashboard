"use client";

import { RevenueData } from "@/lib/stripe/types";
import { DayPicker } from "react-day-picker";

interface RevenueCalendarProps {
  data: RevenueData["data"];
  churnData: { [key: string]: number };
}

export default function RevenueCalendar({ data, churnData }: RevenueCalendarProps) {
  const revenueValues = Object.values(data).filter(v => typeof v === 'number');
  const maxRevenue = Math.max(...revenueValues, 100); // Standardize max to avoid divide by zero

  // Calculate top 20th percentile for "high revenue" if we want a threshold, 
  // but a gradient approach (alpha based on % of max) is often better for heatmaps.

  const formatDay = (props: { date: Date }) => {
    const { date } = props;
    const dateString = date.toISOString().split("T")[0];
    const revenue = data[dateString];
    const churn = churnData[dateString];

    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
    const isInFuture = date > today;

    // Heatmap intensity calculation
    const intensity = revenue ? Math.min((revenue / maxRevenue), 1) : 0;
    // We'll use the primary color with variable opacity for the heatmap effect
    // But CSS vars with opacity is tricky without HSLA.
    // Let's use a class-based opacity scale or inline style for precision.

    const hasChurn = churn && churn > 0;

    return (
      <div
        className={`
          relative flex flex-col items-center justify-between h-full w-full min-h-[5rem] p-1 
          transition-colors border border-[var(--border)]
          ${isToday ? "ring-2 ring-[var(--primary)] z-10" : "hover:border-[var(--primary)]/50"}
          ${isInFuture ? "opacity-60 bg-[var(--background)]" : "bg-[var(--surface)]"}
        `}
        style={{
          // subtle background tint based on revenue, only for past/present
          backgroundColor: (!isInFuture && revenue) ? `color-mix(in srgb, var(--primary) ${Math.round(intensity * 15)}%, var(--surface))` : undefined
        }}
      >
        <div className="w-full flex justify-between items-start">
          <span className={`text-[10px] font-medium ${isToday ? "text-[var(--primary)]" : "text-[var(--muted)]"}`}>
            {date.getDate()}
          </span>
          {hasChurn && (
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]" title={`Churn: -$${churn}`} />
          )}
        </div>

        <div className="flex flex-col items-end w-full mt-auto">
          {revenue !== undefined && (
            <span className={`text-xs font-bold leading-tight ${isInFuture ? "text-[var(--muted)]" : "text-[var(--foreground)]"}`}>
              ${revenue >= 1000 ? (revenue / 1000).toFixed(1) + 'k' : revenue.toFixed(0)}
            </span>
          )}
          {hasChurn && (
            <span className="text-[10px] font-medium text-[var(--danger)] leading-tight">
              -${churn >= 1000 ? (churn / 1000).toFixed(1) + 'k' : churn.toFixed(0)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-sm col-span-1 md:col-span-2 lg:col-span-3">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Revenue Velocity</h2>
        <div className="flex items-center gap-4 text-xs text-[var(--muted)]">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[var(--primary)]/15"></div>
            <span>High Revenue</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-[var(--danger)]"></div>
            <span>Churn Event</span>
          </div>
        </div>
      </div>

      <DayPicker
        mode="single"
        timeZone="America/Los_Angeles"
        components={{
          Day: (props) => formatDay({ date: props.day.date }),
        }}
        classNames={{
          root: "w-full",
          months: "w-full",
          month: "w-full",
          month_caption: "flex items-center justify-center mb-4",
          caption_label: "text-lg font-medium text-[var(--foreground)]",
          nav: "absolute right-0 top-0 flex items-center gap-1",
          button_previous: "p-2 rounded-md hover:bg-[var(--muted)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors",
          button_next: "p-2 rounded-md hover:bg-[var(--muted)]/10 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors",
          month_grid: "w-full",
          weekdays: "grid grid-cols-7 mb-2",
          weekday: "text-[var(--muted)] text-xs font-medium uppercase tracking-wider text-center py-2",
          week: "grid grid-cols-7",
          day: "p-0 relative aspect-square",
          day_button: "h-full w-full p-0 m-0 border-0 bg-transparent cursor-default",
          today: "",
          outside: "opacity-30 pointer-events-none",
          disabled: "opacity-30",
          hidden: "invisible",
        }}
      />
    </div>
  );
}
