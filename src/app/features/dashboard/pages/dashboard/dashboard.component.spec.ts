import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Subject } from 'rxjs';
import { gsap } from 'gsap';
import { DashboardComponent } from './dashboard.component';
import { DashboardDataService } from '../../services/dashboard-data.service';
import { DashboardModule } from '../../dashboard.module';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let response: Subject<any>;
  let source: jasmine.SpyObj<DashboardDataService>;

  const sample: any = {
    totalSales: 87000,
    transactionCount: 1,
    itemsSold: 3,
    salesTrend: [87000],
    previousPeriodSales: 100000,
    comparisonPeriodLabel: 'previous demo day',
    recentTransactions: [{ reference: 'DEMO-123', amount: 87000, itemCount: 1, timeLabel: '10:24 AM' }],
  };

  beforeEach(() => {
    response = new Subject<any>();
    source = jasmine.createSpyObj<DashboardDataService>('DashboardDataService', ['load'], {
      demoAssignedLocation: 'Demo booth',
    });
    source.load.and.returnValue(response.asObservable());
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, DashboardModule],
      providers: [{ provide: DashboardDataService, useValue: source }],
    });
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
  });

  function element(): HTMLElement {
    return fixture.nativeElement;
  }

  it('labels mock data and keeps quick actions available during loading', () => {
    expect(element().textContent).toContain('Demo data');
    expect(element().querySelector('[aria-labelledby="assigned-location-heading"]')?.textContent).toContain('Demo booth');
    expect(element().textContent).not.toContain('Your selling day');
    expect(element().textContent).not.toContain('Preview with sample sales');
    expect(element().querySelector('[role="status"]')?.textContent).toContain('Loading');
    expect(element().querySelector('a[href="/sales"]')?.textContent).toContain('New Sale');
    expect(element().querySelector('a[href="/products"]')?.textContent).toContain('Check Stock');
    expect(element().querySelector('app-recent-transactions')).toBeNull();
  });

  it('renders the supplied totals and recent transactions after loading', () => {
    response.next(sample);
    fixture.detectChanges();
    expect(element().querySelector('[role="status"]')).toBeNull();
    expect(element().querySelector('[aria-labelledby="sales-heading"]')?.textContent).toContain('87,000');
    expect(element().querySelector('dl')?.textContent).toContain('Total Sales');
    expect(element().querySelector('app-recent-transactions')?.textContent).toContain('DEMO-123');
    expect(element().querySelector('a[href="/history"]')).not.toBeNull();
    expect(element().querySelectorAll('lucide-icon svg').length).toBe(9);
    expect(element().querySelectorAll('lucide-icon:not([aria-hidden="true"])').length).toBe(0);
  });

  it('shows zero totals and an empty state without fabricating transactions', () => {
    response.next({ totalSales: 0, transactionCount: 0, itemsSold: 0, recentTransactions: [] });
    fixture.detectChanges();
    expect(element().querySelectorAll('dd')[0]?.textContent).toContain('0');
    expect(element().querySelectorAll('dd')[1]?.textContent?.trim()).toBe('0');
    expect(element().textContent).toContain('No transactions yet');
    expect(element().querySelectorAll('app-recent-transactions li').length).toBe(0);
  });

  it('shows an error and retries successfully without hiding quick actions', () => {
    response.error(new Error('Unavailable'));
    fixture.detectChanges();
    expect(element().querySelector('[role="alert"]')?.textContent).toContain('Sales overview unavailable');
    expect(element().querySelector('a[href="/sales"]')).not.toBeNull();

    response = new Subject<any>();
    source.load.and.returnValue(response.asObservable());
    element().querySelector<HTMLButtonElement>('button')?.click();
    fixture.detectChanges();
    expect(source.load).toHaveBeenCalledTimes(2);
    expect(element().querySelector('[role="status"]')).not.toBeNull();
    response.next(sample);
    fixture.detectChanges();
    expect(element().querySelector('[role="alert"]')).toBeNull();
    expect(element().textContent).toContain('DEMO-123');
  });

  it('unsubscribes from pending data when the page is destroyed', () => {
    expect(response.observed).toBeTrue();
    fixture.destroy();
    expect(response.observed).toBeFalse();
  });

  it('calculates average order from the supplied total and transaction count', () => {
    response.next({ ...sample, totalSales: 1250000, transactionCount: 12, itemsSold: 28 });
    fixture.detectChanges();
    const metrics = element().querySelectorAll('dd');
    expect(metrics[0]?.textContent?.trim()).toBe('12');
    expect(metrics[1]?.textContent?.trim()).toBe('28');
    expect(metrics[2]?.textContent).toContain('104,167');
  });

  for (const comparison of [
    { current: 125, previous: 100, expected: '+25%', positive: true },
    { current: 50, previous: 100, expected: '-50%', positive: false },
    { current: 100, previous: 100, expected: '0%', positive: false },
  ]) {
    it(`renders the ${comparison.expected} comparison without implying positive growth for other states`, () => {
      response.next({ ...sample, totalSales: comparison.current, previousPeriodSales: comparison.previous });
      fixture.detectChanges();
      const trend = element().querySelector('[title="Compared with previous demo day"]');
      expect(trend?.textContent).toContain(comparison.expected);
      expect(trend?.classList.contains('text-positive')).toBe(comparison.positive);
    });
  }

  for (const previous of [0, null, undefined, NaN, Infinity, -10]) {
    it(`omits invalid or unavailable comparison data (${previous})`, () => {
      response.next({ ...sample, transactionCount: 0, previousPeriodSales: previous });
      fixture.detectChanges();
      const card = element().querySelector('[aria-labelledby="sales-heading"]');
      expect(card?.textContent).toContain('No comparison');
      expect(card?.querySelectorAll('dd')[2]?.textContent?.trim()).toBe('—');
      expect(card?.textContent).not.toMatch(/NaN|Infinity/);
    });
  }

  it('does not display growth without a defined comparison period', () => {
    response.next({ ...sample, comparisonPeriodLabel: undefined });
    fixture.detectChanges();
    expect(element().querySelector('[aria-labelledby="sales-heading"]')?.textContent).toContain('No comparison');
  });

  it('does not replay the entrance on change detection or data updates', () => {
    const animate = spyOn(gsap, 'fromTo').and.callThrough();
    fixture.detectChanges();
    response.next(sample);
    fixture.detectChanges();
    expect(animate).toHaveBeenCalledTimes(2); // Ready card and chart, after asynchronous data.
    response.next({ ...sample, totalSales: 90000 });
    fixture.detectChanges();
    fixture.detectChanges();
    expect(animate).toHaveBeenCalledTimes(2);
  });

  it('skips movement when reduced motion is requested', () => {
    fixture.destroy();
    const actualMatchMedia = window.matchMedia.bind(window);
    const reducedQuery = jasmine.createSpyObj<MediaQueryList>('reducedQuery', [
      'addListener', 'removeListener', 'addEventListener', 'removeEventListener', 'dispatchEvent',
    ], { matches: true, media: '(prefers-reduced-motion: reduce)', onchange: null });
    spyOn(window, 'matchMedia').and.callFake(query =>
      query === '(prefers-reduced-motion: reduce)' ? reducedQuery : actualMatchMedia(query));
    const animate = spyOn(gsap, 'fromTo').and.callThrough();

    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    response.next(sample);
    fixture.detectChanges();
    expect(animate).not.toHaveBeenCalled();
    const section = element().querySelector<HTMLElement>('[data-entrance]');
    expect(section?.style.opacity).toBe('');
    expect(section?.style.transform).toBe('');
  });

  it('restores styles and removes component tweens when an entrance is interrupted', () => {
    const sections = Array.from(element().querySelectorAll<HTMLElement>('[data-entrance]'));
    fixture.destroy();
    for (const section of sections) {
      expect(gsap.getTweensOf(section).length).toBe(0);
      expect(section.style.opacity).toBe('');
      expect(section.style.transform).toBe('');
    }
  });

  it('restores visible content on preference changes without replaying the entrance', () => {
    fixture.destroy();
    let reduced = false;
    const actualMatchMedia = window.matchMedia.bind(window);
    const reducedQuery = jasmine.createSpyObj<MediaQueryList>('reducedQuery', [
      'addListener', 'removeListener', 'addEventListener', 'removeEventListener', 'dispatchEvent',
    ]);
    Object.defineProperty(reducedQuery, 'matches', { get: () => reduced });
    spyOn(window, 'matchMedia').and.callFake(query =>
      query === '(prefers-reduced-motion: reduce)' ? reducedQuery : actualMatchMedia(query));
    const animate = spyOn(gsap, 'fromTo').and.callThrough();
    fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    expect(animate).toHaveBeenCalledTimes(1);

    reduced = true;
    gsap.matchMediaRefresh();
    for (const section of Array.from(element().querySelectorAll<HTMLElement>('[data-entrance]'))) {
      expect(section.style.opacity).toBe('');
      expect(section.style.transform).toBe('');
      expect(gsap.getTweensOf(section).length).toBe(0);
    }
    reduced = false;
    gsap.matchMediaRefresh();
    expect(animate).toHaveBeenCalledTimes(1);
  });
});
