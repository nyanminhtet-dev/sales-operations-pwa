/** UI preview models only; these do not define a backend contract. */
export interface DashboardTransaction {
  readonly reference: string;
  readonly amount: number;
  readonly itemCount: number;
  readonly timeLabel: string;
}

export interface DashboardData {
  readonly totalSales: number;
  readonly transactionCount: number;
  readonly recentTransactions: readonly DashboardTransaction[];
}
