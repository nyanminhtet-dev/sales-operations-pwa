import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BOOTH_STOCK_MOCK } from '../config/booth-stock.mock';

@Component({
  selector: 'app-booth-stock',
  templateUrl: './booth-stock.component.html',
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
  readonly movements: any[] = this.demo.movements.map((movement: any) => {
    const presentation: any = {
      out: { label: 'Checked out', icon: 'arrow-up-right', sign: '+', style: 'text-brand bg-brand-soft' },
      in: { label: 'Checked in', icon: 'arrow-down-right', sign: '-', style: 'text-positive bg-green-50' },
      sold: { label: 'Sold', icon: 'shopping-cart', sign: '-', style: 'text-brand bg-brand-soft' },
    };
    return {
      ...movement, ...presentation[movement.type],
      units: movement.lines.reduce((sum: number, line: any) => sum + line.units, 0),
      productLabel: movement.lines.map((line: any) => {
        const item = this.variants.find((variant: any) => variant.id === line.variantId);
        return `${item.name} - ${item.variant}`;
      }).join(' · '),
    };
  }).sort((a: any, b: any) => b.at.localeCompare(a.at));
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
