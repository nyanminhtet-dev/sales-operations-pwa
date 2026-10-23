import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BOOTH_STOCK_MOCK, BOOTH_STOCK_MOVEMENTS } from '../../config/booth-stock.mock';

@Component({
  selector: 'app-booth-stock',
  templateUrl: './booth-stock.component.html',
  styleUrls: ['./booth-stock.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoothStockComponent {
  readonly demo: any = BOOTH_STOCK_MOCK;
  readonly variants: any[] = this.demo.variants;
  readonly totalUnits = this.variants.reduce((sum: number, item: any) => sum + item.available, 0);
  readonly variantCount = new Set(this.variants.map((item: any) => item.id)).size;
  readonly lowStockItems: any[] = this.variants
    .filter((item: any) => item.available < this.demo.lowStockThreshold)
    .sort((a: any, b: any) => a.available - b.available);
  readonly movements: any[] = BOOTH_STOCK_MOVEMENTS;
  readonly soldToday = this.activityUnits('sold');
  readonly checkedOutToday = this.activityUnits('out');
  readonly failedImages = new Set<string>();
  selectedVariantId: string | null = null;
  transferNotice = '';

  private activityUnits(type: string): number {
    return this.movements.filter((item: any) => item.type === type && item.at.startsWith(this.demo.reportingDate))
      .reduce((sum: number, item: any) => sum + item.units, 0);
  }

  trackById(_index: number, item: any): string { return item.id; }

  toggleVariant(id: string): void {
    this.selectedVariantId = this.selectedVariantId === id ? null : id;
  }

  previewTransfer(direction: 'out' | 'in'): void {
    this.transferNotice = `${direction === 'out' ? 'Check Out' : 'Check In'} is a demo action. No stock has been moved.`;
  }
}
