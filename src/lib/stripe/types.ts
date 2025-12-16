export interface RevenueData {
    planBreakdown: { [planName: string]: number };
    totalMRR: number;
    uniqueUsersCount: number;
    data: { [key: string]: number };
}

export interface ChurnData {
    cancelingUsersCount: number;
    mrrAtRisk: number;
    churnsByDate: { [key: string]: number };
    planBreakdown: { [planName: string]: number };
}