import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CHECK_OUT_MOCK } from '../../config/check-out.mock';
import { gsap } from 'gsap';
import { Subscription } from 'rxjs';
import { CheckOutCatalogService } from '../../services/check-out-catalog.service';

@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckOutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('pageTitle', { static: true }) private pageTitle?: ElementRef<HTMLElement>;
  private motion?: gsap.Context;
  private actionCardObserver?: ResizeObserver;
  private preference?: MediaQueryList;
  private scrollContainer?: HTMLElement;
  private catalogSubscription?: Subscription;
  private returnFrame?: number;
  private browseScrollTop = 0;
  products: any[] = [];
  catalogState: 'loading' | 'ready' | 'error' = 'loading';
  detailProduct: any = null;
  detailQuantities: any = {};
  selectionNotice = '';
  headerScrolled = false;
  private readonly onScroll = () => {
    const scrolled = (this.scrollContainer?.scrollTop ?? 0) > 0;
    if (scrolled === this.headerScrolled) return;
    this.headerScrolled = scrolled;
    this.changeDetector.markForCheck();
  };
  private readonly onMotionPreferenceChange = () => {
    if (this.preference?.matches) this.motion?.revert();
  };

  @ViewChild('actionCard') set actionCard(card: ElementRef<HTMLElement> | undefined) {
    this.actionCardObserver?.disconnect();
    this.actionCardObserver = undefined;
    // Reserve only the space occupied by the current floating card, including
    // text wrapping and accessibility font-size changes.
    const updateClearance = () => this.element.nativeElement.style.setProperty(
      '--checkout-action-height', `${card?.nativeElement.offsetHeight ?? 0}px`);
    updateClearance();
    if (card) {
      this.actionCardObserver = new ResizeObserver(updateClearance);
      this.actionCardObserver.observe(card.nativeElement);
    }
    this.motion?.revert();
    this.motion = undefined;
    if (!card || this.step !== 'select' || this.preference?.matches) return;
    this.motion = gsap.context(() => {
      gsap.fromTo(card.nativeElement, { y: 32, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.28, ease: 'power2.out', clearProps: 'transform,opacity',
      });
    }, card.nativeElement);
  }
  readonly demo: any = CHECK_OUT_MOCK;
  readonly categories = ['All', 'Apparel', 'Accessories', 'Bags', 'Hats'];
  readonly stages = ['Select', 'Review', 'Confirm'];
  step: 'select' | 'review' | 'confirm' | 'success' = 'select';
  query = '';
  category = 'All';
  filtersOpen = false;
  availableOnly = false;
  selected: any[] = [];
  receipt: any = null;
  validationMessage = '';

  constructor(private readonly router: Router, private readonly changeDetector: ChangeDetectorRef,
    private readonly element: ElementRef<HTMLElement>, readonly catalog: CheckOutCatalogService) {}

  ngOnInit(): void {
    this.preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.preference.addEventListener('change', this.onMotionPreferenceChange);
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.scrollContainer = this.pageTitle?.nativeElement.closest('main') ?? undefined;
    this.scrollContainer?.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();
  }

  ngOnDestroy(): void {
    this.catalogSubscription?.unsubscribe();
    if (this.returnFrame !== undefined) cancelAnimationFrame(this.returnFrame);
    this.actionCardObserver?.disconnect();
    this.scrollContainer?.removeEventListener('scroll', this.onScroll);
    this.motion?.revert();
    this.preference?.removeEventListener('change', this.onMotionPreferenceChange);
  }

  loadProducts(): void {
    this.catalogSubscription?.unsubscribe();
    this.catalogState = 'loading';
    this.catalogSubscription = this.catalog.loadProducts().subscribe({
      next: products => { this.products = products; this.catalogState = 'ready'; this.changeDetector.markForCheck(); },
      error: () => { this.catalogState = 'error'; this.changeDetector.markForCheck(); },
    });
  }

  get visibleProducts(): any[] {
    const query = this.query.trim().toLocaleLowerCase();
    return this.products.filter((item: any) =>
      (this.category === 'All' || item.category === this.category) &&
      (!this.availableOnly || item.variants.some((variant: any) => this.catalog.canReceive(variant))) &&
      (item.name.toLocaleLowerCase().includes(query) || item.variants.some((variant: any) => variant.sku.toLocaleLowerCase().includes(query))));
  }

  openProduct(product: any): void {
    if (this.returnFrame !== undefined) cancelAnimationFrame(this.returnFrame);
    this.browseScrollTop = this.scrollContainer?.scrollTop ?? 0;
    this.detailQuantities = Object.fromEntries(this.selected.map(row => [row.variant.id, row.control.value]));
    this.detailProduct = product;
    this.selectionNotice = '';
    this.pageTitle?.nativeElement.focus();
    this.scrollContainer?.scrollTo({ top: 0, behavior: 'auto' });
  }

  closeProduct(): void {
    const id = this.detailProduct?.id;
    this.detailProduct = null;
    this.pageTitle?.nativeElement.focus();
    this.returnFrame = requestAnimationFrame(() => {
      this.returnFrame = undefined;
      this.scrollContainer?.scrollTo({ top: this.browseScrollTop, behavior: 'auto' });
      const button = Array.from(this.element.nativeElement.querySelectorAll<HTMLButtonElement>('[data-product-id]'))
        .find(item => item.dataset['productId'] === id);
      button?.focus({ preventScroll: true });
    });
  }

  addFromDetails(selection: any): void {
    const variant = this.detailProduct?.variants.find((item: any) => item.id === selection.variantId);
    if (!variant || !this.add(variant, selection.quantity)) return;
    this.selectionNotice = `${selection.quantity} ${selection.quantity === 1 ? 'unit' : 'units'} of ${variant.name} added to checkout.`;
    this.closeProduct();
  }

  lineTotal(row: any): number | null {
    return this.catalog.hasPrice(row.variant) && row.control.valid ? row.variant.salePrice * row.control.value : null;
  }
  get totalValue(): number | null {
    return this.selectionValid && this.selected.every(row => this.lineTotal(row) !== null)
      ? this.selected.reduce((sum, row) => sum + (this.lineTotal(row) ?? 0), 0) : null;
  }

  get totalUnits(): number {
    return this.selected.reduce((sum: number, row: any) => sum + (Number.isSafeInteger(row.control.value) && row.control.value > 0 ? row.control.value : 0), 0);
  }
  get selectionValid(): boolean { return this.selected.length > 0 && this.selected.every(row => row.control.valid); }
  get stepIndex(): number { return this.step === 'select' ? 0 : this.step === 'review' ? 1 : 2; }
  quantityFor(id: string): number { return this.selected.find(row => row.variant.id === id)?.control.value ?? 0; }
  trackById(_index: number, item: any): string { return item.id ?? item.variant.id; }

  add(variant: any, quantity = 1): boolean {
    if (this.step !== 'select' || !this.catalog.canReceive(variant) || !Number.isSafeInteger(quantity) || quantity < 1) return false;
    const existing = this.selected.find(row => row.variant.id === variant.id);
    if (existing) {
      if (existing.control.invalid || existing.control.value + quantity > variant.available) return false;
      existing.control.setValue(existing.control.value + quantity);
      return true;
    }
    if (quantity > variant.available) return false;
    const control = new FormControl(quantity, {
      validators: [Validators.required, Validators.min(1), Validators.max(variant.available), Validators.pattern(/^\d+$/)],
    });
    this.selected = [...this.selected, { variant, product: this.products.find(item => item.id === variant.productId), control }];
    this.validationMessage = '';
    return true;
  }

  adjust(row: any, delta: number): void {
    if (!['select', 'review'].includes(this.step)) return;
    const quantity = row.control.value;
    if (!Number.isSafeInteger(quantity)) return;
    const next = quantity + delta;
    if (next >= 1 && next <= row.variant.available) row.control.setValue(next);
  }

  remove(id: string): void {
    if (this.step === 'review') this.selected = this.selected.filter(row => row.variant.id !== id);
  }

  clear(): void {
    if (this.step !== 'select' && this.step !== 'review') return;
    this.selected = [];
    this.validationMessage = '';
    this.selectionNotice = '';
  }
  resetFilters(): void { this.query = ''; this.category = 'All'; this.availableOnly = false; }

  private validSelection(): boolean {
    if (this.selectionValid) { this.validationMessage = ''; return true; }
    this.selected.forEach(row => row.control.markAsTouched());
    this.validationMessage = 'Select at least one variant and enter whole quantities within the available stock.';
    return false;
  }

  review(): void { if (this.step === 'select' && this.validSelection()) this.showStep('review'); }
  reviewTransfer(): void { if (this.step === 'review' && this.validSelection()) this.showStep('confirm'); }
  edit(): void { if (this.step === 'confirm') this.showStep('review'); }
  selectMore(): void { if (this.step === 'review') this.showStep('select'); }

  confirm(): void {
    if (this.step !== 'confirm' || !this.validSelection()) return;
    this.receipt = {
      reference: this.demo.reference, at: this.demo.at,
      variants: this.selected.length, units: this.totalUnits,
      lines: this.selected.map(row => ({ variant: row.variant, quantity: row.control.value })),
    };
    this.showStep('success');
  }

  back(): void {
    if (this.detailProduct) { this.closeProduct(); return; }
    if (this.step === 'review') this.showStep('select');
    else if (this.step === 'confirm') this.showStep('review');
    else void this.router.navigateByUrl('/products');
  }

  private showStep(step: 'select' | 'review' | 'confirm' | 'success'): void {
    this.step = step;
    // The persistent title provides a stable keyboard/screen-reader focus target.
    this.pageTitle?.nativeElement.focus();
    this.pageTitle?.nativeElement.closest('main')?.scrollTo({ top: 0, behavior: 'auto' });
  }
}
