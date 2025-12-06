"use client";

import { Users, TrendingDown } from "lucide-react";

interface ChurnCardProps {
  data: {
    cancelingUsersCount: number;
    mrrAtRisk: number;
  };
}

export default function ChurnCard({ data }: ChurnCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-gray-500">Churn Metrics</h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <p className="text-sm text-gray-600">Users Set to Cancel</p>
            <p className="text-2xl font-bold text-red-500">{data.cancelingUsersCount}</p>
          </div>
        </div>
        <div className="flex items-center">
          <TrendingDown className="h-6 w-6 text-gray-500 mr-4" />
          <div>
            <p className="text-sm text-gray-600">MRR at Risk</p>
            <p className="text-2xl font-bold text-red-500">${data.mrrAtRisk.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
