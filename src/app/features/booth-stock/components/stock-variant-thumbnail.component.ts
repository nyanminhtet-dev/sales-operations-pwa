import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-stock-variant-thumbnail',
  host: { class: 'block h-12 w-12 shrink-0', 'aria-hidden': 'true' },
  template: `
    <span class="flex h-full w-full items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-page text-text-muted">
      <img *ngIf="variant?.image && !failed; else fallback" [src]="variant.image" [alt]="variant.imageAlt || variant.name || 'Sample product photo'" width="48" height="48" loading="lazy" decoding="async" (error)="failed = true" class="h-full w-full object-cover" />
      <ng-template #fallback><lucide-icon name="box" [size]="24" [strokeWidth]="1.5" /></ng-template>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockVariantThumbnailComponent implements OnChanges {
  @Input() variant: any;
  failed = false;
  ngOnChanges(): void { this.failed = false; }
}
