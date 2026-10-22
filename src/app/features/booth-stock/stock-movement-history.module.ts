import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { StockMovementHistoryComponent } from './pages/stock-movement-history.component';

/** Lazy entry under More; stock data remains owned by the Booth Stock feature. */
@NgModule({
  declarations: [StockMovementHistoryComponent],
  imports: [SharedModule, RouterModule.forChild([
    { path: '', component: StockMovementHistoryComponent, title: 'Stock movement history | PK Counter' },
  ])],
})
export class StockMovementHistoryModule {}
