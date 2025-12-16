"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStripeApiKey } from "@/contexts/StripeContext";
import RevenueCalendar from "@/components/RevenueCalendar";
import ChurnCard from "@/components/ChurnCard";
import { getProjectedRevenue, getChurnMetrics } from "@/lib/stripe/actions";
import { TrendingUp } from "lucide-react";
import { ChurnData, RevenueData } from "@/lib/stripe/types";
import MrrCard from "@/components/MrrCard";

export default function DashboardPage() {
  const { apiKey, isLoading } = useStripeApiKey();
  const router = useRouter();
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [uniqueUsersCount, setUniqueUsersCount] = useState<number | null>(null);
  const [mrrData, setMrrData] = useState<number | null>(null);
  const [churnData, setChurnData] = useState<ChurnData | null>(null);
  const [planBreakdown, setPlanBreakdown] = useState<{ [key: string]: number } | null>(null);
  const [planBreakdownAtRisk, setPlanBreakdownAtRisk] = useState<{ [key: string]: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !apiKey) {
      router.push("/settings");
    }
  }, [apiKey, isLoading, router]);

  useEffect(() => {
    if (apiKey) {
      const fetchData = async () => {
        try {
          const revenueResult = await getProjectedRevenue(apiKey);
          if (revenueResult.success) {
            setRevenueData(revenueResult);
            if (revenueResult.data === null) {
              setError("No revenue data available.");
              return;
            }
            setMrrData(revenueResult.totalMRR);
            setUniqueUsersCount(revenueResult.uniqueUsersCount);
            setPlanBreakdown(revenueResult.planBreakdown);
          } else {
            setError(revenueResult.error || "Failed to fetch revenue data.");
          }

          const churnResult = await getChurnMetrics(apiKey);
          if (churnResult.success) {
            setChurnData(churnResult.data);
          } else {
            setError(churnResult.error || "Failed to fetch churn data.");
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("An unexpected error occurred.");
          }
        }
      };
      fetchData();
    }
  }, [apiKey]);

  if (isLoading || !apiKey) {
    return <div className="flex h-[50vh] items-center justify-center text-[var(--muted)]">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Financial Overview</h1>
        {/* Date Picker could go here */}
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Metric Cards Row */}
        <div className="col-span-1">
          {mrrData ? <MrrCard data={revenueData!} /> : <div className="h-64 bg-[var(--surface)] rounded-xl animate-pulse" />}
        </div>

        <div className="col-span-1">
          {churnData ? <ChurnCard data={churnData!} /> : <div className="h-64 bg-[var(--surface)] rounded-xl animate-pulse" />}
        </div>

        {/* Placeholder for future metric (LTV or similar) to complete row, or just empty space/info */}
        <div className="col-span-1 hidden lg:block bg-[var(--surface)]/50 border border-[var(--border)] border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <p className="text-[var(--muted)] text-sm font-medium">LTV / CAC Calculation</p>
          <p className="text-[var(--muted)] text-xs mt-1">Coming Soon</p>
        </div>

        {/* Calendar spans full width */}
        {churnData ? (
          <RevenueCalendar data={revenueData?.data || {}} churnData={churnData?.churnsByDate || {}} />
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-3 h-96 bg-[var(--surface)] rounded-xl animate-pulse" />
        )}
      </div>
    </div>
  );
}
