import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { gsap } from 'gsap';
import { SalesCatalogueService } from '../../services/sales-catalogue.service';
import { SalesPurchasesModule } from '../../sales-purchases.module';
import { SalesComponent } from './sales.component';

describe('Sales header', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [SalesPurchasesModule] }));

  it('has a labeled editable search field for product names, SKUs and barcodes', () => {
    const fixture = TestBed.createComponent(SalesComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const input = element.querySelector<HTMLInputElement>('input[type="search"]');
    expect(element.querySelector('h1')?.textContent).toBe('Sales');
    expect(element.querySelector('h1')?.classList.contains('sr-only')).toBeTrue();
    expect(element.textContent).not.toContain('Find products to add to your sale');
    expect(Array.from(element.querySelectorAll('header button')).map(button => button.getAttribute('aria-label')))
      .toEqual(['Scan barcode (coming soon)', 'Cart (coming soon)']);
    expect(element.querySelector('label')?.getAttribute('for')).toBe(input?.id);
    expect(element.querySelector('label')?.textContent).toContain('name, SKU or barcode');
    expect(input?.getAttribute('aria-describedby')).toBe('sales-preview-note');
    if (!input) throw new Error('Missing product search field');
    for (const query of ['PK Counter shirt', 'SKU-001', '1234567890123']) {
      input.value = query;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(input.value).toBe(query);
    }
  });

  it('keeps scanning and cart access honest placeholders without a fake count or route', () => {
    const fixture = TestBed.createComponent(SalesComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector<HTMLButtonElement>('[aria-label="Cart (coming soon)"]')?.disabled).toBeTrue();
    expect(element.querySelector<HTMLButtonElement>('[aria-label="Scan barcode (coming soon)"]')?.disabled).toBeTrue();
    expect(element.querySelector('header a')).toBeNull();
    expect(element.querySelector('button span')).toBeNull();
    expect(element.querySelectorAll('header lucide-icon[aria-hidden="true"] svg').length).toBe(3);
    expect(element.querySelector('#sales-preview-note')?.textContent).toContain('coming soon');
  });
});

describe('Sales catalogue', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [SalesPurchasesModule] }));

  it('loads explicit preview data and filters name, SKU, barcode and category without losing the selected view', fakeAsync(() => {
    const fixture = TestBed.createComponent(SalesComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading products');
    flushMicrotasks();
    fixture.detectChanges();
    const page = fixture.componentInstance;
    expect(page.products.length).toBe(6);
    expect(fixture.nativeElement.textContent).toContain('Demo catalogue');
    page.view = 'list';
    page.selectCategory('Apparel');
    expect(page.visibleProducts.length).toBe(2);
    page.search('DEMO-TEE');
    expect(page.visibleProducts.map(product => product.name)).toEqual(['PK T-Shirt']);
    page.resetFilters();
    page.search('demo1001');
    expect(page.visibleProducts.map(product => product.name)).toEqual(['PK Cap']);
    page.search('hoodie');
    expect(page.visibleProducts.length).toBe(1);
    expect(page.view).toBe('list');
  }));

  it('switches actual card layouts through the toolbar and sorts the displayed products', fakeAsync(() => {
    const fixture = TestBed.createComponent(SalesComponent);
    fixture.detectChanges(); flushMicrotasks(); fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLButtonElement>('[aria-label="List view"]')?.click();
    fixture.detectChanges();
    expect(element.querySelector('article')?.classList.contains('flex')).toBeTrue();
    expect(element.querySelector('[aria-label="List view"]')?.getAttribute('aria-pressed')).toBe('true');
    const sort = element.querySelector<HTMLSelectElement>('select');
    if (!sort) throw new Error('Missing sort control');
    sort.value = 'price-desc'; sort.dispatchEvent(new Event('change')); fixture.detectChanges();
    expect(fixture.componentInstance.visibleProducts[0].name).toBe('PK Hoodie');
    sort.value = 'price-asc'; sort.dispatchEvent(new Event('change')); fixture.detectChanges();
    expect(fixture.componentInstance.visibleProducts[0].name).toBe('PK Keychain');
    sort.value = ''; sort.dispatchEvent(new Event('change')); fixture.detectChanges();
    expect(fixture.componentInstance.visibleProducts[0].name).toBe('PK Cap');
    element.querySelector<HTMLButtonElement>('[aria-label="Grid view"]')?.click(); fixture.detectChanges();
    expect(element.querySelector('article')?.classList.contains('flex')).toBeFalse();
  }));

  it('shows an empty state and clears filters through the UI', fakeAsync(() => {
    const fixture = TestBed.createComponent(SalesComponent);
    fixture.detectChanges(); flushMicrotasks(); fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const input = element.querySelector<HTMLInputElement>('input');
    if (!input) throw new Error('Missing search');
    input.value = 'unmatched'; input.dispatchEvent(new Event('input')); fixture.detectChanges();
    expect(element.textContent).toContain('No products found');
    const clear = Array.from(element.querySelectorAll('button')).find(button => button.textContent?.includes('Clear filters'));
    clear?.click(); fixture.detectChanges();
    expect(input.value).toBe('');
    expect(element.querySelectorAll('article').length).toBe(6);
  }));

  it('handles errors, retries, and unsubscribes from a pending load when destroyed', () => {
    const pending = new Subject<any>();
    const load = spyOn(TestBed.inject(SalesCatalogueService), 'load').and.returnValues(throwError(() => new Error('Unavailable')), of([]), pending);
    const fixture = TestBed.createComponent(SalesComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Unable to load the catalogue');
    const retry = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>).find(button => button.textContent === 'Retry');
    retry?.click(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No products found');
    fixture.componentInstance.load();
    expect(pending.observed).toBeTrue();
    fixture.destroy();
    expect(pending.observed).toBeFalse();
    expect(load).toHaveBeenCalledTimes(3);
  });
});

describe('Sales view transition', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [SalesPurchasesModule] }));

  it('animates only view changes, handles rapid toggles, and restores styles on destruction', fakeAsync(() => {
    spyOn(window, 'matchMedia').and.returnValue({ matches: false, addEventListener: () => {}, removeEventListener: () => {} } as unknown as MediaQueryList);
    const animate = spyOn(gsap, 'fromTo').and.callThrough();
    const fixture = TestBed.createComponent(SalesComponent);
    fixture.detectChanges(); flushMicrotasks(); fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const list = element.querySelector<HTMLButtonElement>('[aria-label="List view"]');
    const grid = element.querySelector<HTMLButtonElement>('[aria-label="Grid view"]');
    const container = element.querySelector<HTMLElement>('app-sales-product-card')?.parentElement;
    if (!container) throw new Error('Missing catalogue');
    expect(animate).not.toHaveBeenCalled();
    list?.click(); fixture.detectChanges();
    expect(animate).toHaveBeenCalledTimes(1);
    fixture.detectChanges(); list?.click(); fixture.detectChanges();
    expect(animate).toHaveBeenCalledTimes(1);
    grid?.click(); fixture.detectChanges();
    expect(animate).toHaveBeenCalledTimes(2);
    expect(gsap.getTweensOf(container).length).toBe(1);
    gsap.getTweensOf(container).forEach(tween => tween.progress(1));
    expect(container.style.opacity).toBe('');
    expect(container.style.transform).toBe('');
    list?.click(); fixture.detectChanges(); fixture.destroy();
    expect(gsap.getTweensOf(container).length).toBe(0);
    expect(container.style.transform).toBe('');
    expect(container.style.opacity).toBe('');
  }));

  it('switches instantly with reduced motion and removes the preference listener', fakeAsync(() => {
    const addListener = jasmine.createSpy('addEventListener');
    const removeListener = jasmine.createSpy('removeEventListener');
    spyOn(window, 'matchMedia').and.returnValue({ matches: true, addEventListener: addListener, removeEventListener: removeListener } as unknown as MediaQueryList);
    const animate = spyOn(gsap, 'fromTo').and.callThrough();
    const fixture = TestBed.createComponent(SalesComponent);
    fixture.detectChanges(); flushMicrotasks(); fixture.detectChanges();
    fixture.nativeElement.querySelector('[aria-label="List view"]').click(); fixture.detectChanges();
    expect(fixture.componentInstance.view).toBe('list');
    expect(animate).not.toHaveBeenCalled();
    fixture.destroy();
    expect(removeListener).toHaveBeenCalledWith('change', addListener.calls.first().args[1]);
  }));
});
