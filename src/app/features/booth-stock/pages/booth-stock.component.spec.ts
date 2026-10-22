import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../shared/shared.module';
import { BoothStockComponent } from './booth-stock.component';
import { BOOTH_STOCK_MOCK } from '../config/booth-stock.mock';

describe('Booth Stock static prototype', () => {
  let fixture: ComponentFixture<BoothStockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [BoothStockComponent], imports: [SharedModule] });
    fixture = TestBed.createComponent(BoothStockComponent);
    fixture.detectChanges();
  });

  it('renders the complete labelled demo instead of unavailable inventory', () => {
    const element: HTMLElement = fixture.nativeElement;
    const page = fixture.componentInstance;
    expect(element.textContent).toContain('Yangon Main Booth');
    expect(element.textContent).toContain('Demo data');
    expect(element.textContent).not.toContain('not connected');
    expect(element.textContent).not.toContain('unavailable');
    expect(element.querySelector('[data-total-units]')?.textContent).toBe('248');
    expect(page.variantCount).toBe(6);
    expect(page.lowStockItems.map(item => item.available)).toEqual([3, 4, 5]);
    expect(page.soldToday).toBe(12);
    expect(page.checkedOutToday).toBe(24);
    expect(element.querySelectorAll('li').length).toBe(6);
  });

  it('uses distinct mock variants and valid movement lines with consistent directions', () => {
    const ids = new Set(BOOTH_STOCK_MOCK.variants.map((item: any) => item.id));
    expect(ids.size).toBe(BOOTH_STOCK_MOCK.variants.length);
    expect(BOOTH_STOCK_MOCK.variants.reduce((sum: number, item: any) => sum + item.available, 0)).toBe(248);
    BOOTH_STOCK_MOCK.movements.forEach((movement: any) => {
      movement.lines.forEach((line: any) => { expect(ids.has(line.variantId)).toBeTrue(); expect(line.units).toBeGreaterThan(0); });
    });
    expect(fixture.componentInstance.movements.map(item => item.sign + item.units)).toEqual(['+24', '-2', '-12']);
    const times = fixture.nativeElement.querySelectorAll('time');
    expect(times[0].textContent).toBe('Oct 22, 11:00 AM');
  });

  it('opens and closes demo row details with accessible expanded state', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button[aria-controls]');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click(); fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    const details = fixture.nativeElement.querySelector('#' + button.getAttribute('aria-controls'));
    expect(details.hidden).toBeFalse();
    expect(details.textContent).toContain('3 units available');
    button.click(); fixture.detectChanges();
    expect(details.hidden).toBeTrue();
  });

  it('keeps both transfer actions white and never mutates mock holdings', () => {
    const before = JSON.stringify(BOOTH_STOCK_MOCK);
    const buttons = fixture.nativeElement.querySelectorAll('button[aria-describedby="transfer-preview"]');
    buttons[0].click(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Check Out is a demo action');
    expect(buttons[0].classList.contains('bg-surface')).toBeTrue();
    buttons[1].click(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Check In is a demo action');
    expect(buttons[1].classList.contains('bg-surface')).toBeTrue();
    expect(JSON.stringify(BOOTH_STOCK_MOCK)).toBe(before);
    expect(fixture.componentInstance.totalUnits).toBe(248);
  });

  it('falls back to a decorative icon when a thumbnail fails', () => {
    const image: HTMLImageElement = fixture.nativeElement.querySelector('img');
    const thumbnail = image.parentElement;
    image.dispatchEvent(new Event('error')); fixture.detectChanges();
    expect(thumbnail?.querySelector('img')).toBeNull();
    expect(thumbnail?.querySelector('lucide-icon[name="box"]')).not.toBeNull();
  });
});
