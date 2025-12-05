'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStripeApiKey } from '@/contexts/StripeContext';
import RevenueCalendar from '@/components/RevenueCalendar';
import ChurnCard from '@/components/ChurnCard';
import { getProjectedRevenue, getChurnMetrics } from '@/lib/stripe/actions';

type RevenueData = { [key: string]: number };

type ChurnData = {
  cancelingUsersCount: number;
  mrrAtRisk: number;
};

export default function DashboardPage() {
  const { apiKey, isLoading } = useStripeApiKey();
  const router = useRouter();
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [churnData, setChurnData] = useState<ChurnData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !apiKey) {
      router.push('/settings');
    }
  }, [apiKey, isLoading, router]);

  useEffect(() => {
    if (apiKey) {
      const fetchData = async () => {
        try {
          const revenueResult = await getProjectedRevenue(apiKey);
          if (revenueResult.success) {
            setRevenueData(revenueResult.data);
          } else {
            setError(revenueResult.error || 'Failed to fetch revenue data.');
          }

          const churnResult = await getChurnMetrics(apiKey);
          if (churnResult.success) {
            setChurnData(churnResult.data);
          } else {
            setError(churnResult.error || 'Failed to fetch churn data.');
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unexpected error occurred.');
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
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
            {revenueData ? (
                <RevenueCalendar data={revenueData} />
            ) : (
                <p>Loading revenue data...</p>
            )}
        </div>
        <div>
            {churnData ? (
                <ChurnCard data={churnData} />
            ) : (
                <p>Loading churn data...</p>
            )}
        </div>
      </div>
    </div>
  );
}
