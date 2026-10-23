import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../../../shared/shared.module';
import { StockVariantThumbnailComponent } from '../../components/stock-variant-thumbnail.component';
import { CHECK_OUT_MOCK } from '../../config/check-out.mock';
import { BOOTH_STOCK_MOCK } from '../../config/booth-stock.mock';
import { CheckOutComponent } from './check-out.component';
import { gsap } from 'gsap';
import { CheckOutProductDetailComponent } from '../../components/check-out-product-detail/check-out-product-detail.component';
import { CheckOutCatalogService } from '../../services/check-out-catalog.service';
import { Subject, of } from 'rxjs';

describe('Check Out UI workflow', () => {
  let fixture: ComponentFixture<CheckOutComponent>;
  let page: CheckOutComponent;
  let preference: any;
  let scrollContainer: HTMLElement;

  function render(): void {
    fixture.debugElement.injector.get(ChangeDetectorRef).detectChanges();
  }

  beforeEach(() => {
    preference = { matches: false, addEventListener: jasmine.createSpy(), removeEventListener: jasmine.createSpy() };
    spyOn(window, 'matchMedia').and.returnValue(preference);
    TestBed.configureTestingModule({
      declarations: [CheckOutComponent, StockVariantThumbnailComponent, CheckOutProductDetailComponent],
      imports: [SharedModule, ReactiveFormsModule, RouterTestingModule],
    });
    fixture = TestBed.createComponent(CheckOutComponent);
    page = fixture.componentInstance;
    scrollContainer = document.createElement('main');
    Object.defineProperty(scrollContainer, 'scrollTop', { value: 0, writable: true });
    scrollContainer.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  it('fades header glass in only when scrolled and removes the listener on destroy', () => {
    const glass: HTMLElement = fixture.nativeElement.querySelector('.checkout-header-glass');
    expect(glass.classList.contains('opacity-0')).toBeTrue();
    scrollContainer.scrollTop = 80;
    scrollContainer.dispatchEvent(new Event('scroll')); render();
    expect(glass.classList.contains('opacity-100')).toBeTrue();
    scrollContainer.scrollTop = 0;
    scrollContainer.dispatchEvent(new Event('scroll')); render();
    expect(glass.classList.contains('opacity-0')).toBeTrue();
    fixture.destroy();
    scrollContainer.scrollTop = 100;
    scrollContainer.dispatchEvent(new Event('scroll'));
    expect(page.headerScrolled).toBeFalse();
  });

  it('starts with no selection and disables review and unavailable variants', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(page.step).toBe('select');
    expect(page.totalUnits).toBe(0);
    expect(element.textContent).toContain('Demo only');
    expect(element.querySelectorAll('[data-product-id]').length).toBe(5);
    expect(element.querySelector('footer')).toBeNull();
    page.review();
    expect(page.step).toBe('select');
    expect(page.validationMessage).toContain('Select at least one');
  });

  it('pops up the review card once per appearance and cleans up interrupted motion', () => {
    page.add(CHECK_OUT_MOCK.variants[0]); render();
    const card: HTMLElement = fixture.nativeElement.querySelector('footer');
    const tween = gsap.getTweensOf(card)[0];
    expect(tween).toBeDefined();
    expect(gsap.getProperty(card, 'y')).toBe(32);
    page.add(CHECK_OUT_MOCK.variants[0]); render();
    expect(gsap.getTweensOf(card)[0]).toBe(tween);
    preference.matches = true;
    preference.addEventListener.calls.first().args[1]();
    expect(card.style.transform).toBe('');
    expect(card.style.opacity).toBe('');
    expect(gsap.getTweensOf(card).length).toBe(0);
    fixture.destroy();
    expect(preference.removeEventListener).toHaveBeenCalled();
  });

  it('shows the final card immediately for reduced motion and fills connectors on forward/back steps', () => {
    preference.matches = true;
    page.add(CHECK_OUT_MOCK.variants[0]); render();
    const card: HTMLElement = fixture.nativeElement.querySelector('footer');
    expect(gsap.getTweensOf(card).length).toBe(0);
    expect(card.style.opacity).toBe('');
    expect(fixture.nativeElement.querySelectorAll('.journey-fill.is-complete').length).toBe(0);
    page.review(); render();
    expect(fixture.nativeElement.querySelectorAll('.journey-fill.is-complete').length).toBe(1);
    page.reviewTransfer(); render();
    expect(fixture.nativeElement.querySelectorAll('.journey-fill.is-complete').length).toBe(2);
    page.back(); render();
    expect(fixture.nativeElement.querySelectorAll('.journey-fill.is-complete').length).toBe(1);
  });

  it('filters by name or SKU, combines categories with available stock, and clears filters', () => {
    page.query = 'pk-tee-wht';
    expect(page.visibleProducts.map(item => item.id)).toEqual(['tee']);
    page.query = '  cap ';
    page.category = 'Hats';
    expect(page.visibleProducts.length).toBe(1);
    page.availableOnly = true;
    expect(page.visibleProducts.map(item => item.id)).toEqual(['cap']);
    page.category = 'Bags';
    expect(page.visibleProducts.length).toBe(0);
    render();
    expect(fixture.nativeElement.textContent).toContain('No products found');
    page.resetFilters();
    expect(page.visibleProducts.length).toBe(CHECK_OUT_MOCK.products.length);
  });

  it('clears all products in selection without resetting filters and retains transfer details only in confirmation', () => {
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[aria-label="Transfer direction"]')).toBeNull();
    const clear = element.querySelector<HTMLButtonElement>('[aria-label="Shared pool variants"] button');
    expect(clear?.disabled).toBeTrue();
    page.query = 'tee';
    page.category = 'Apparel';
    page.add(CHECK_OUT_MOCK.variants[0]);
    page.add(CHECK_OUT_MOCK.variants[1]);
    render();
    clear?.click(); render();
    expect(page.selected).toEqual([]);
    expect(page.totalUnits).toBe(0);
    expect(page.quantityFor(CHECK_OUT_MOCK.variants[0].id)).toBe(0);
    expect(page.query).toBe('tee');
    expect(page.category).toBe('Apparel');
    expect(element.querySelector('footer')).toBeNull();
    expect(clear?.disabled).toBeTrue();
    page.add(CHECK_OUT_MOCK.variants[0]);
    page.review(); page.reviewTransfer(); render();
    expect(element.querySelector('[aria-label="Transfer direction"]')).not.toBeNull();
    page.clear();
    expect(page.selected.length).toBe(1);
  });

  it('reuses a selected variant and enforces add and stepper bounds', () => {
    const variant = CHECK_OUT_MOCK.variants[2];
    page.add(variant); page.add(variant);
    expect(page.selected.length).toBe(1);
    expect(page.totalUnits).toBe(2);
    const row = page.selected[0];
    row.control.setValue(variant.available);
    page.add(variant); page.adjust(row, 1);
    expect(row.control.value).toBe(variant.available);
    row.control.setValue(1); page.adjust(row, -1);
    expect(row.control.value).toBe(1);
    page.add(CHECK_OUT_MOCK.variants[3]);
    expect(page.selected.length).toBe(1);
  });

  it('rejects empty, zero, negative, fractional and excessive quantities', () => {
    page.add(CHECK_OUT_MOCK.variants[0]); page.review();
    const row = page.selected[0];
    for (const value of [null, 0, -1, 1.5, row.variant.available + 1]) {
      row.control.setValue(value); render();
      expect(page.selectionValid).toBeFalse();
      expect(fixture.nativeElement.querySelector('input[type="number"]').getAttribute('aria-invalid')).toBe('true');
      page.reviewTransfer();
      expect(page.step).toBe('review');
    }
    row.control.setValue(10);
    expect(page.selectionValid).toBeTrue();
    page.reviewTransfer();
    expect(page.step).toBe('confirm');
  });

  it('preserves selection across edit/back steps and prevents empty review continuation', () => {
    page.add(CHECK_OUT_MOCK.variants[0]); page.review();
    page.selected[0].control.setValue(7);
    page.reviewTransfer(); page.edit();
    expect(page.step).toBe('review'); expect(page.totalUnits).toBe(7);
    page.selectMore(); expect(page.step).toBe('select');
    page.review(); page.remove('tee-white');
    expect(page.selected.length).toBe(0);
    page.reviewTransfer(); expect(page.step).toBe('review');
    page.selectMore(); page.add(CHECK_OUT_MOCK.variants[0]); page.review(); page.clear();
    expect(page.selectionValid).toBeFalse();
    render();
    expect(fixture.nativeElement.textContent).toContain('No items selected');
  });

  it('builds the success receipt from current quantities without changing either inventory fixture', () => {
    const poolBefore = JSON.stringify(CHECK_OUT_MOCK);
    const boothBefore = JSON.stringify(BOOTH_STOCK_MOCK);
    for (const index of [0, 2, 4]) page.add(CHECK_OUT_MOCK.variants[index]);
    page.review();
    [10, 12, 10].forEach((units, index) => page.selected[index].control.setValue(units));
    page.reviewTransfer();
    expect(page.totalUnits).toBe(32);
    page.confirm(); render();
    expect(page.step).toBe('success');
    expect(page.receipt.units).toBe(32);
    expect(page.receipt.variants).toBe(3);
    expect(page.receipt.reference).toBe('STK-CO-DEMO-001');
    expect(fixture.nativeElement.textContent).toContain('32 units shown as received');
    const receipt = page.receipt;
    page.confirm();
    expect(page.receipt).toBe(receipt);
    expect(JSON.stringify(CHECK_OUT_MOCK)).toBe(poolBefore);
    expect(JSON.stringify(BOOTH_STOCK_MOCK)).toBe(boothBefore);
    expect(fixture.nativeElement.querySelector('a[href="/more/stock-movements"]')).not.toBeNull();
  });

  it('uses the current total rather than the example amount of 32', () => {
    page.add(CHECK_OUT_MOCK.variants[0]); page.review();
    page.selected[0].control.setValue(9);
    page.reviewTransfer(); page.confirm();
    expect(page.receipt.units).toBe(9);
    expect(page.receipt.lines[0].quantity).toBe(9);
  });

  it('moves backward through steps and exits to Stock from selection', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.returnValue(Promise.resolve(true));
    page.add(CHECK_OUT_MOCK.variants[0]); page.review(); page.reviewTransfer();
    page.back(); expect(page.step).toBe('review');
    page.back(); expect(page.step).toBe('select');
    page.back(); expect(navigate).toHaveBeenCalledWith('/products');
  });

  it('uses an icon fallback for failed parent-product photos', () => {
    const thumbnail: HTMLElement = fixture.nativeElement.querySelector('app-stock-variant-thumbnail');
    thumbnail.querySelector('img')?.dispatchEvent(new Event('error')); render();
    expect(thumbnail.querySelector('img')).toBeNull();
    expect(thumbnail.querySelector('lucide-icon[name="box"]')).not.toBeNull();
  });

  it('preserves filters and distinct variant identities through product details and review', () => {
    page.query = 'tee'; page.category = 'Apparel';
    page.openProduct(page.products[0]); render();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Product Details');
    page.addFromDetails({ variantId: 'tee-white', quantity: 3 }); render();
    expect(page.detailProduct).toBeNull();
    page.openProduct(page.products[0]);
    page.addFromDetails({ variantId: 'tee-black', quantity: 2 });
    page.openProduct(page.products[0]);
    page.addFromDetails({ variantId: 'tee-white', quantity: 1 });
    expect(page.selected.map(row => row.variant.id)).toEqual(['tee-white', 'tee-black']);
    expect(page.totalUnits).toBe(6);
    expect(page.quantityFor('tee-white')).toBe(4);
    expect(page.query).toBe('tee'); expect(page.category).toBe('Apparel');
    expect(page.totalValue).toBeNull();
    page.review(); page.reviewTransfer(); page.confirm();
    expect(page.receipt.lines.map((line: any) => line.variant.id)).toEqual(['tee-white', 'tee-black']);
    expect(page.receipt.units).toBe(6);
  });

  it('exposes loading and retryable errors without fabricating products', () => {
    const catalog = TestBed.inject(CheckOutCatalogService);
    const pending = new Subject<any[]>();
    const load = spyOn(catalog, 'loadProducts').and.returnValue(pending);
    page.loadProducts(); render();
    expect(fixture.nativeElement.textContent).toContain('Loading products');
    pending.error(new Error('Unavailable')); render();
    expect(fixture.nativeElement.textContent).toContain('Products could not be loaded');
    load.and.returnValue(of([])); page.loadProducts(); render();
    expect(fixture.nativeElement.textContent).toContain('No products found');
  });

  it('rejects unavailable or excessive detail additions and never supplies a partial total', () => {
    page.openProduct(page.products[1]);
    page.addFromDetails({ variantId: 'cap-white', quantity: 1 });
    page.addFromDetails({ variantId: 'cap-black', quantity: 43 });
    expect(page.selected.length).toBe(0);
    expect(page.detailProduct).not.toBeNull();
    page.add({ ...CHECK_OUT_MOCK.variants[2], salePrice: 100 }, 2);
    expect(page.totalValue).toBe(200);
    page.add(CHECK_OUT_MOCK.variants[0]);
    expect(page.totalValue).toBeNull();
  });
});
