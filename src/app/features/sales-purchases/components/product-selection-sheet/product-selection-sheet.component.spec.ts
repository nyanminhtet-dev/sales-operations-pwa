import { TestBed } from '@angular/core/testing';
import { gsap } from 'gsap';
import { SalesPurchasesModule } from '../../sales-purchases.module';
import { ProductSelectionSheetComponent } from './product-selection-sheet.component';
import { SalesProductCardComponent } from '../sales-product-card/sales-product-card.component';

describe('Product selection', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [SalesPurchasesModule] }));

  it('opens a modal with variants and quantity, skips motion when reduced, closes and cleans up', () => {
    spyOn(window, 'matchMedia').and.callFake(query => ({
      matches: query.includes('reduce') && !query.includes('no-preference'), media: query,
      onchange: null, addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true,
    }));
    const entrance = spyOn(gsap, 'from').and.callThrough();
    const fixture = TestBed.createComponent(ProductSelectionSheetComponent);
    fixture.componentRef.setInput('product', { name: 'Demo shirt', sku: 'DEMO', price: 1000, variants: ['Small', 'Large'] });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const dialog = element.querySelector('dialog');
    expect(dialog?.open).toBeTrue();
    expect(dialog?.matches(':modal')).toBeTrue();
    expect(entrance).not.toHaveBeenCalled();
    expect(element.querySelector<HTMLButtonElement>('[aria-label="Decrease quantity"]')?.disabled).toBeTrue();
    element.querySelector<HTMLButtonElement>('[aria-label="Increase quantity"]')?.click(); fixture.detectChanges();
    expect(element.querySelector('output')?.textContent).toBe('2');
    const close = element.querySelector<HTMLButtonElement>('[aria-label="Close product selection"]');
    close?.focus();
    close?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }));
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Increase quantity');
    document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(close);
    const radio = element.querySelector<HTMLInputElement>('input[type="radio"]');
    radio?.click(); fixture.detectChanges();
    expect(fixture.componentInstance.variant).toBe('Small');
    expect(Array.from(element.querySelectorAll('button')).find(button => button.textContent === 'Add to Cart')?.disabled).toBeTrue();
    const dismissed = spyOn(fixture.componentInstance.dismissed, 'emit');
    const cancel = new Event('cancel', { cancelable: true });
    dialog?.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBeTrue();
    expect(dialog?.open).toBeFalse();
    expect(dismissed).toHaveBeenCalledTimes(1);
    fixture.destroy();
    expect(dialog?.open).toBeFalse();
  });

  it('animates once, closes from the backdrop, and reverts resources on destruction', () => {
    spyOn(window, 'matchMedia').and.callFake(query => ({
      matches: query.includes('no-preference'), media: query,
      onchange: null, addListener: () => {}, removeListener: () => {},
      addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true,
    }));
    const entrance = spyOn(gsap, 'from').and.callThrough();
    const fixture = TestBed.createComponent(ProductSelectionSheetComponent);
    fixture.componentRef.setInput('product', { name: 'Demo', sku: 'DEMO', price: 1000 });
    fixture.detectChanges(); fixture.detectChanges();
    expect(entrance).toHaveBeenCalledTimes(1);
    const dialog: HTMLDialogElement = fixture.nativeElement.querySelector('dialog');
    const panel: HTMLElement = fixture.nativeElement.querySelector('.selection-panel');
    dialog.click();
    gsap.getTweensOf(panel).forEach(tween => tween.progress(1));
    expect(dialog.open).toBeFalse();
    fixture.destroy();
    expect(gsap.getTweensOf(panel).length).toBe(0);
    expect(panel.style.transform).toBe('');
    expect(panel.style.opacity).toBe('');
  });

  it('reuses the same selection output for card and plus and falls back on failed images', () => {
    const fixture = TestBed.createComponent(SalesProductCardComponent);
    const product = { id: 'demo', name: 'Demo', sku: 'DEMO', price: 1000, imageUrl: 'data:image/png;base64,invalid' };
    fixture.componentRef.setInput('product', product); fixture.detectChanges();
    const selected = spyOn(fixture.componentInstance.selectProduct, 'emit');
    const element: HTMLElement = fixture.nativeElement;
    element.querySelectorAll('button').forEach(button => button.click());
    expect(selected.calls.allArgs()).toEqual([[product], [product]]);
    element.querySelector('img')?.dispatchEvent(new Event('error')); fixture.detectChanges();
    expect(element.querySelector('img')).toBeNull();
    expect(element.textContent).toContain('No image');
  });
});
