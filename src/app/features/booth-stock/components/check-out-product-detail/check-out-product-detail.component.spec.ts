import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../../shared/shared.module';
import { CheckOutProductDetailComponent } from './check-out-product-detail.component';

describe('Check Out product variant selection', () => {
  let fixture: ComponentFixture<CheckOutProductDetailComponent>;
  let detail: CheckOutProductDetailComponent;
  const product = {
    id: 'test', name: 'Test product', images: [],
    variants: [
      { id: 'white-s', color: 'White', size: 'S', sku: 'WHITE-S', available: 5, salePrice: 100, status: 'active' },
      { id: 'black-m', color: 'Black', size: 'M', sku: 'BLACK-M', available: 2, status: 'active' },
      { id: 'black-l', color: 'Black', size: 'L', sku: 'BLACK-L', available: 0, status: 'active' },
      { id: 'red-m', color: 'Red', size: 'M', sku: 'RED-M', available: 10, status: 'inactive' },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [CheckOutProductDetailComponent], imports: [SharedModule, ReactiveFormsModule] });
    fixture = TestBed.createComponent(CheckOutProductDetailComponent);
    detail = fixture.componentInstance;
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();
  });

  it('selects only real combinations and updates SKU, price and availability', () => {
    expect(detail.variant.id).toBe('white-s');
    expect(detail.sizeExists('M')).toBeFalse();
    detail.chooseSize('M');
    expect(detail.variant.id).toBe('white-s');
    detail.chooseColor('Black');
    expect(detail.variant.id).toBe('black-m');
    expect(detail.catalog.hasPrice(detail.variant)).toBeFalse();
    expect(detail.remaining).toBe(2);
    detail.chooseSize('L');
    expect(detail.variant.id).toBe('black-l');
    expect(detail.canAdd).toBeFalse();
    detail.chooseColor('Red');
    expect(detail.canAdd).toBeFalse();
  });

  it('validates whole quantities against remaining stock and emits exact variant identity', () => {
    fixture.componentRef.setInput('selectedQuantities', { 'white-s': 3 }); fixture.detectChanges();
    expect(detail.remaining).toBe(2);
    const added = spyOn(detail.addSelection, 'emit');
    for (const invalid of [0, -1, 1.5, 3]) {
      detail.quantity.setValue(invalid); detail.add();
      expect(added).not.toHaveBeenCalled();
    }
    detail.quantity.setValue(2); detail.add();
    expect(added).toHaveBeenCalledOnceWith({ variantId: 'white-s', quantity: 2 });
  });

  it('requires explicit SKU selection when options identify multiple variants', () => {
    fixture.componentRef.setInput('product', { ...product, variants: [product.variants[0], { ...product.variants[0], id: 'other-s', sku: 'OTHER-S' }] });
    fixture.detectChanges();
    detail.chooseColor('White');
    expect(detail.variant).toBeNull();
    expect(detail.canAdd).toBeFalse();
    detail.chooseVariant('other-s');
    expect(detail.variant.sku).toBe('OTHER-S');
  });

  it('handles missing images, empty variants and missing attribute values', () => {
    expect(fixture.nativeElement.textContent).toContain('Image unavailable');
    fixture.componentRef.setInput('product', { ...product, variants: [] }); fixture.detectChanges();
    expect(detail.canAdd).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('No variants available');
    fixture.componentRef.setInput('product', { ...product, variants: [{ id: 'plain', sku: 'PLAIN', available: 3 }] }); fixture.detectChanges();
    expect(detail.variant.id).toBe('plain');
    expect(detail.colors).toEqual([]); expect(detail.sizes).toEqual([]);
    expect(detail.canAdd).toBeTrue();
  });

  it('switches product gallery images without changing the variant and falls back on image errors', () => {
    fixture.componentRef.setInput('product', { ...product, images: ['first.jpg', 'second.jpg'] }); fixture.detectChanges();
    const buttons: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('[aria-label^="Show product image"]');
    buttons[1].click(); fixture.detectChanges();
    expect(detail.image).toBe('second.jpg');
    expect(detail.variant.id).toBe('white-s');
    fixture.nativeElement.querySelector('img[alt="Test product product photo"]').dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Image unavailable');
  });
});
