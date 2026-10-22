import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BOOTH_STOCK_MOCK, BOOTH_STOCK_MOVEMENTS } from '../config/booth-stock.mock';

@Component({
  selector: 'app-stock-movement-history',
  templateUrl: './stock-movement-history.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockMovementHistoryComponent {
  readonly demo: any = BOOTH_STOCK_MOCK;
  readonly movements: any[] = BOOTH_STOCK_MOVEMENTS;
  trackById(_index: number, item: any): string { return item.id; }
}
