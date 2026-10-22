import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { Subject, takeUntil } from 'rxjs';
import { SalesCatalogueService } from '../services/sales-catalogue.service';

@Component({
  selector: 'app-sales',
  host: { class: 'block' },
  templateUrl: './sales.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('catalogueView') catalogueView?: ElementRef<HTMLElement>;
  products: any[] = [];
  visibleProducts: any[] = [];
  categories: string[] = ['All'];
  category = 'All';
  query = '';
  sort = '';
  view: 'grid' | 'list' = 'grid';
  loading = true;
  error = false;
  selectedProduct: any = null;
  private readonly destroyed$ = new Subject<void>();
  private viewAnimation?: gsap.Context;
  private viewAnimationPending = false;
  private motionPreference?: MediaQueryList;
  private readonly onMotionChange = () => {
    if (this.motionPreference?.matches) this.clearViewAnimation();
  };

  constructor(private catalogue: SalesCatalogueService, private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.motionPreference.addEventListener('change', this.onMotionChange);
    this.load();
  }

  selectView(view: 'grid' | 'list'): void {
    if (this.view === view) return;
    this.clearViewAnimation();
    this.view = view;
    this.viewAnimationPending = true;
  }

  ngAfterViewChecked(): void {
    if (!this.viewAnimationPending) return;
    this.viewAnimationPending = false;
    const container = this.catalogueView?.nativeElement;
    if (!container || this.motionPreference?.matches) return;
    // Animate only after Angular has applied the new layout, once per toggle.
    this.viewAnimation = gsap.context(() => {
      gsap.fromTo(container, { opacity: 0.5, y: 8 }, {
        opacity: 1, y: 0, duration: 0.24, ease: 'power1.out', clearProps: 'opacity,transform',
      });
    }, container);
  }

  private clearViewAnimation(): void {
    this.viewAnimation?.revert();
    this.viewAnimation = undefined;
  }

  load(): void {
    this.loading = true;
    this.error = false;
    this.catalogue.load().pipe(takeUntil(this.destroyed$)).subscribe({
      next: (products: any[]) => {
        this.products = products;
        this.categories = ['All', ...new Set<string>(products.map(product => product.category).filter(Boolean))];
        this.loading = false;
        this.filter();
        this.changeDetector.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.error = true;
        this.changeDetector.markForCheck();
      },
    });
  }

  search(value: string): void { this.query = value; this.filter(); }
  selectCategory(value: string): void { this.category = value; this.filter(); }
  selectSort(value: string): void { this.sort = value; this.filter(); }
  resetFilters(): void { this.query = ''; this.category = 'All'; this.filter(); }

  private filter(): void {
    const query = this.query.trim().toLocaleLowerCase();
    this.visibleProducts = this.products.filter(product =>
      (this.category === 'All' || product.category === this.category) &&
      [product.name, product.sku, product.barcode].some(value => String(value ?? '').toLocaleLowerCase().includes(query)));
    if (this.sort === 'name') this.visibleProducts.sort((a, b) => a.name.localeCompare(b.name));
    if (this.sort === 'price-asc') this.visibleProducts.sort((a, b) => a.price - b.price);
    if (this.sort === 'price-desc') this.visibleProducts.sort((a, b) => b.price - a.price);
  }

  trackProduct(_index: number, product: any): string { return product.id; }

  ngOnDestroy(): void {
    this.clearViewAnimation();
    this.motionPreference?.removeEventListener('change', this.onMotionChange);
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
