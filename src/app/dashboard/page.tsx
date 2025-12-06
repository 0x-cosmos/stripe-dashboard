"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStripeApiKey } from "@/contexts/StripeContext";
import RevenueCalendar from "@/components/RevenueCalendar";
import ChurnCard from "@/components/ChurnCard";
import { getProjectedRevenue, getChurnMetrics } from "@/lib/stripe/actions";

type RevenueData = { [key: string]: number };

type ChurnData = {
  cancelingUsersCount: number;
  mrrAtRisk: number;
  churnsByDate: { [key: string]: number };
};

export default function DashboardPage() {
  const { apiKey, isLoading } = useStripeApiKey();
  const router = useRouter();
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [mrrData, setMrrData] = useState<number | null>(null);
  const [churnData, setChurnData] = useState<ChurnData | null>(null);
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
            setRevenueData(revenueResult.data);
            if (revenueResult.data === null) {
              setError("No revenue data available.");
              return;
            }
            setMrrData(revenueResult.totalMRR);
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
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Dashboard</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2">
          {revenueData ? <RevenueCalendar data={revenueData} churnData={churnData?.churnsByDate || {}} /> : <p>Loading revenue data...</p>}
        </div>
        {/* Current MRR minus expected churn */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-gray-500">MRR</h2>
            <p className="text-2xl font-bold text-green-500">${mrrData?.toFixed(2) ?? "Loading..."}</p>
          </div>
        </div>
        {/* Users set to cancel */}
        <div className="md:col-span-1">{churnData ? <ChurnCard data={churnData} /> : <p>Loading churn data...</p>}</div>
      </div>
    </div>
  );
}
