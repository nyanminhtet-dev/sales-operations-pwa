import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardModule } from '../../dashboard.module';
import { RecentTransactionsComponent } from './recent-transactions.component';

describe('RecentTransactionsComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [DashboardModule, RouterTestingModule] }));

  function render(transactions: any) {
    const fixture = TestBed.createComponent(RecentTransactionsComponent);
    fixture.componentRef.setInput('transactions', transactions);
    fixture.detectChanges();
    return fixture;
  }

  const transaction = { reference: 'DEMO-001245', amount: 87000, itemCount: 3, timeLabel: '10:24 AM' };

  it('uses existing fields, limits the preview to three rows, and links View All to History', () => {
    const input = Array.from({ length: 4 }, (_, index) => ({ ...transaction, reference: `DEMO-${index}`, itemCount: index + 1 }));
    const fixture = render(input);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('li').length).toBe(3);
    expect(element.textContent).toContain('Demo data');
    expect(element.textContent).toContain('MMK 87,000');
    expect(element.textContent).toContain('1 item');
    expect(element.textContent).toContain('2 items');
    expect(element.textContent).toContain('10:24 AM');
    expect(element.textContent).not.toContain('DEMO-3');
    expect(element.querySelector('a')?.textContent).toContain('View All');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/history');
    expect(input.length).toBe(4);
  });

  it('uses decorative neutral thumbnails and omits unsupported photos and statuses', () => {
    const fixture = render([transaction]);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('li lucide-icon[name="box"][aria-hidden="true"] svg')).not.toBeNull();
    expect(element.querySelector('img')).toBeNull();
    expect(element.textContent).not.toMatch(/Completed|Returned/);
    expect(element.querySelector('h2')?.textContent).toBe('Recent Transactions');
    expect(element.querySelector('lucide-icon[name="history"] svg')).not.toBeNull();
  });

  for (const input of [[], null, undefined]) {
    it(`preserves an empty state for ${JSON.stringify(input)}`, () => {
      const element: HTMLElement = render(input).nativeElement;
      expect(element.textContent).toContain('No transactions yet');
      expect(element.querySelector('li')).toBeNull();
      expect(element.querySelector('a')?.getAttribute('href')).toBe('/history');
    });
  }

  it('handles missing and invalid metadata without fabricating values', () => {
    const fixture = render([{ reference: ' ', amount: NaN, itemCount: -1, timeLabel: '' }]);
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Reference unavailable');
    expect(element.textContent).toContain('Item count unavailable');
    expect(element.textContent).toContain('Time unavailable');
    expect(element.querySelector('[aria-label="Amount unavailable"]')?.textContent).toBe('—');
    expect(element.textContent).not.toMatch(/NaN|Infinity|Completed|Returned/);
  });

  it('keeps zero amounts and quantities intact', () => {
    const element: HTMLElement = render([{ ...transaction, amount: 0, itemCount: 0 }]).nativeElement;
    expect(element.textContent).toContain('MMK 0');
    expect(element.textContent).toContain('0 items');
  });

  it('truncates a long reference at narrow widths without overflowing the card', () => {
    const reference = 'DEMO-' + '1234567890'.repeat(20);
    const element: HTMLElement = render([{ ...transaction, reference }]).nativeElement;
    element.style.display = 'block';
    element.style.width = '288px';
    const label = element.querySelector<HTMLElement>('p[title]');
    expect(label?.title).toBe(reference);
    expect(label?.classList.contains('truncate')).toBeTrue();
    expect(element.querySelector('section')?.scrollWidth).toBeLessThanOrEqual(288);
  });
});
