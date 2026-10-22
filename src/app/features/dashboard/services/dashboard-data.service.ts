import { Injectable } from '@angular/core';
import { defer, from, Observable } from 'rxjs';

// Demo aggregates and comparison values only; these do not define an API contract.
const DEMO_DASHBOARD: any = {
  totalSales: 1250000,
  transactionCount: 12,
  itemsSold: 28,
  salesTrend: [50000, 100000, 150000, 250000, 300000, 400000],
  previousPeriodSales: 1000000,
  comparisonPeriodLabel: 'previous demo day',
  recentTransactions: [
    { reference: 'DEMO-001245', amount: 87000, itemCount: 3, timeLabel: '10:24 AM' },
    { reference: 'DEMO-001244', amount: 42000, itemCount: 1, timeLabel: '9:12 AM' },
    { reference: 'DEMO-001243', amount: 63000, itemCount: 2, timeLabel: '8:47 AM' },
  ],
};

@Injectable({ providedIn: 'root' })
export class DashboardDataService {
  /** Temporary display-only assignment for the UI preview, not authenticated user data. */
  readonly demoAssignedLocation: any = 'Main Booth (Central Mall)';

  /** Replace this mock source when the dashboard API and business rules are confirmed. */
  load(): Observable<any> {
    return defer(() => from(Promise.resolve(DEMO_DASHBOARD)));
  }
}
