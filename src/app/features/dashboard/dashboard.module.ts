import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RecentTransactionsComponent } from './components/recent-transactions/recent-transactions.component';
import { MiniSalesChartComponent } from './components/mini-sales-chart/mini-sales-chart.component';

@NgModule({
  declarations: [DashboardComponent, RecentTransactionsComponent, MiniSalesChartComponent],
  imports: [
    SharedModule,
    DashboardRoutingModule,
  ],
})
export class DashboardModule {}
