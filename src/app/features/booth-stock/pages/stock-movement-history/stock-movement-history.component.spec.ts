import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../../../shared/shared.module';
import { BOOTH_STOCK_MOVEMENTS } from '../../config/booth-stock.mock';
import { StockMovementHistoryComponent } from './stock-movement-history.component';

describe('Stock movement history', () => {
  it('shows the same demo records as Stock and provides a link back to More', () => {
    TestBed.configureTestingModule({ declarations: [StockMovementHistoryComponent], imports: [SharedModule, RouterTestingModule] });
    const fixture = TestBed.createComponent(StockMovementHistoryComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance.movements).toBe(BOOTH_STOCK_MOVEMENTS);
    expect(element.querySelectorAll('li').length).toBe(3);
    expect(element.textContent).toContain('Demo data');
    expect(element.textContent).toContain('Checked out');
    expect(element.textContent).toContain('Checked in');
    expect(element.textContent).toContain('Sold');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/more');
  });
});
