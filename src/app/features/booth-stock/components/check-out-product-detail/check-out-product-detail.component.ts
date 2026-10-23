import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CheckOutCatalogService } from '../../services/check-out-catalog.service';

@Component({
  selector: 'app-check-out-product-detail',
  templateUrl: './check-out-product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckOutProductDetailComponent implements OnChanges {
  @Input() product: any;
  @Input() selectedQuantities: any = {};
  @Output() addSelection = new EventEmitter<any>();
  readonly quantity = new FormControl(1, { nonNullable: true });
  colors: string[] = [];
  sizes: string[] = [];
  color: string | null = null;
  size: string | null = null;
  variant: any = null;
  imageIndex = 0;
  failedImages = new Set<string>();
  private candidateId: string | null = null;

  constructor(readonly catalog: CheckOutCatalogService) {}

  ngOnChanges(): void {
    this.colors = [...new Set<string>(this.product.variants.map((item: any) => item.color).filter(Boolean))];
    this.sizes = [...new Set<string>(this.product.variants.map((item: any) => item.size).filter(Boolean))];
    const initial = this.product.variants.find((item: any) => this.catalog.canReceive(item) &&
      item.available > (this.selectedQuantities[item.id] ?? 0)) ?? this.product.variants[0];
    this.color = initial?.color ?? null;
    this.size = initial?.size ?? null;
    this.candidateId = initial?.id ?? null;
    this.imageIndex = 0;
    this.failedImages.clear();
    this.updateVariant();
  }

  get candidates(): any[] {
    return this.product.variants.filter((item: any) =>
      (item.color ?? null) === this.color && (item.size ?? null) === this.size);
  }
  get remaining(): number { return Math.max(0, (this.variant?.available ?? 0) - (this.selectedQuantities[this.variant?.id] ?? 0)); }
  get canAdd(): boolean { return this.catalog.canReceive(this.variant) && this.remaining > 0 && this.quantity.valid; }
  get image(): string | undefined { return this.product.images?.[this.imageIndex]; }

  chooseColor(color: string): void {
    this.color = color;
    // Preserve a size only if it exists for the chosen color; never synthesize combinations.
    const matching = this.product.variants.filter((item: any) => item.color === color);
    if (!matching.some((item: any) => (item.size ?? null) === this.size)) this.size = matching[0]?.size ?? null;
    this.candidateId = null;
    this.updateVariant();
  }

  sizeExists(size: string): boolean {
    return this.product.variants.some((item: any) => (item.color ?? null) === this.color && item.size === size);
  }
  chooseSize(size: string): void {
    if (!this.sizeExists(size)) return;
    this.size = size;
    this.candidateId = null;
    this.updateVariant();
  }
  chooseVariant(id: string): void { this.candidateId = id; this.updateVariant(); }

  private updateVariant(): void {
    const candidates = this.candidates;
    this.variant = candidates.length === 1 ? candidates[0] : candidates.find(item => item.id === this.candidateId) ?? null;
    this.quantity.setValidators([Validators.required, Validators.min(1), Validators.max(this.remaining), Validators.pattern(/^\d+$/)]);
    this.quantity.setValue(1);
  }

  adjust(delta: number): void {
    const value = this.quantity.value + delta;
    if (Number.isSafeInteger(value) && value >= 1 && value <= this.remaining) this.quantity.setValue(value);
  }
  add(): void {
    this.quantity.markAsTouched();
    if (this.canAdd) this.addSelection.emit({ variantId: this.variant.id, quantity: this.quantity.value });
  }
}
