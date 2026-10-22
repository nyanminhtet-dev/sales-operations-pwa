import { TestBed } from '@angular/core/testing';
import { DashboardModule } from '../../dashboard.module';
import { MiniSalesChartComponent } from './mini-sales-chart.component';
import { gsap } from 'gsap';

describe('MiniSalesChartComponent', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [DashboardModule] }));

  it('normalizes bars proportionally and keeps them decorative', () => {
    const fixture = TestBed.createComponent(MiniSalesChartComponent);
    fixture.componentRef.setInput('values', [25, 50, 100]);
    fixture.detectChanges();
    expect(fixture.componentInstance.heights).toEqual([25, 50, 100]);
    const element: HTMLElement = fixture.nativeElement;
    expect(Array.from(element.querySelectorAll<HTMLElement>('span')).map(bar => bar.style.height)).toEqual(['25%', '50%', '100%']);
    expect(element.getAttribute('aria-hidden')).toBe('true');
  });

  for (const values of [[], [0, 0], [NaN, Infinity, -5], null, 'invalid']) {
    it(`shows a neutral baseline for ${JSON.stringify(values)}`, () => {
      const fixture = TestBed.createComponent(MiniSalesChartComponent);
      fixture.componentRef.setInput('values', values);
      fixture.detectChanges();
      expect(fixture.componentInstance.heights).toEqual([]);
      expect((fixture.nativeElement as HTMLElement).querySelector('[style]')).toBeNull();
    });
  }

  it('ignores invalid, negative, and nonnumeric values without changing valid proportions', () => {
    const fixture = TestBed.createComponent(MiniSalesChartComponent);
    fixture.componentRef.setInput('values', [10, -5, NaN, Infinity, '20', 0, 20]);
    fixture.detectChanges();
    expect(fixture.componentInstance.heights).toEqual([50, 0, 0, 0, 0, 0, 100]);
  });

  it('reveals bars left to right, preserves final heights, and does not replay for equivalent inputs', () => {
    const animate = spyOn(gsap, 'fromTo').and.callThrough();
    const fixture = TestBed.createComponent(MiniSalesChartComponent);
    fixture.componentRef.setInput('values', [25, 50, 100]);
    fixture.detectChanges();
    const bars = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[data-sales-bar]'));
    const tween = gsap.getTweensOf(bars)[0];
    expect(tween).toBeDefined();
    expect(tween.duration()).toBeCloseTo(0.55, 2);
    tween.totalTime(0.1);
    expect(Number(gsap.getProperty(bars[0], 'scaleY'))).toBeGreaterThan(Number(gsap.getProperty(bars[2], 'scaleY')));
    tween.totalProgress(1);
    expect(bars.map(bar => bar.style.height)).toEqual(['25%', '50%', '100%']);
    expect(bars.every(bar => bar.style.transform === '')).toBeTrue();
    fixture.componentRef.setInput('values', [25, 50, 100]);
    fixture.detectChanges();
    fixture.detectChanges();
    expect(animate).toHaveBeenCalledTimes(1);
  });

  it('interrupts an entrance for changed data and displays new heights immediately', () => {
    const animate = spyOn(gsap, 'fromTo').and.callThrough();
    const fixture = TestBed.createComponent(MiniSalesChartComponent);
    fixture.componentRef.setInput('values', [25, 50, 100]);
    fixture.detectChanges();
    fixture.componentRef.setInput('values', [100, 20]);
    fixture.detectChanges();
    const bars = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[data-sales-bar]'));
    expect(bars.map(bar => bar.style.height)).toEqual(['100%', '20%']);
    expect(bars.every(bar => bar.style.transform === '')).toBeTrue();
    expect(gsap.getTweensOf(bars).length).toBe(0);
    expect(animate).toHaveBeenCalledTimes(1);
  });

  it('shows final bars immediately for reduced motion', () => {
    const actualMatchMedia = window.matchMedia.bind(window);
    const query = jasmine.createSpyObj<MediaQueryList>('reducedQuery', ['addListener', 'removeListener'], { matches: true });
    spyOn(window, 'matchMedia').and.callFake(value => value === '(prefers-reduced-motion: reduce)' ? query : actualMatchMedia(value));
    const animate = spyOn(gsap, 'fromTo').and.callThrough();
    const fixture = TestBed.createComponent(MiniSalesChartComponent);
    fixture.componentRef.setInput('values', [50, 100]);
    fixture.detectChanges();
    expect(animate).not.toHaveBeenCalled();
    const bars = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[data-sales-bar]'));
    expect(bars.map(bar => bar.style.height)).toEqual(['50%', '100%']);
    expect(bars.every(bar => bar.style.transform === '')).toBeTrue();
  });

  it('cleans up an interrupted entrance on destruction without changing heights', () => {
    const fixture = TestBed.createComponent(MiniSalesChartComponent);
    fixture.componentRef.setInput('values', [50, 100]);
    fixture.detectChanges();
    const bars = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('[data-sales-bar]'));
    fixture.destroy();
    expect(gsap.getTweensOf(bars).length).toBe(0);
    expect(bars.map(bar => bar.style.height)).toEqual(['50%', '100%']);
    expect(bars.every(bar => bar.style.transform === '')).toBeTrue();
  });
});
