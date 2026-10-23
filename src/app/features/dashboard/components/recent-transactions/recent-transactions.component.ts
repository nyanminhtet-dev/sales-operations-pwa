import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-recent-transactions',
  templateUrl: './recent-transactions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentTransactionsComponent implements OnChanges {
  @Input() transactions: any[] = [];
  rows: any[] = [];

  ngOnChanges(): void {
    // Map only the existing preview fields; no image or status contract is available.
    this.rows = (Array.isArray(this.transactions) ? this.transactions : []).slice(0, 3).map(transaction => ({
      reference: typeof transaction?.reference === 'string' && transaction.reference.trim()
        ? transaction.reference : null,
      amount: Number.isFinite(transaction?.amount) && transaction.amount >= 0 ? transaction.amount : null,
      itemCount: Number.isInteger(transaction?.itemCount) && transaction.itemCount >= 0 ? transaction.itemCount : null,
      timeLabel: typeof transaction?.timeLabel === 'string' && transaction.timeLabel.trim()
        ? transaction.timeLabel : null,
    }));
  }

  trackByReference(index: number, transaction: any): string | number {
    return transaction.reference ?? index;
  }
}
