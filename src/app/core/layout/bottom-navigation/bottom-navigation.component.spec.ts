import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { LucideAngularComponent } from 'lucide-angular';
import { gsap } from 'gsap';
import { AppModule } from '../../../app.module';
import { BottomNavigationComponent } from './bottom-navigation.component';

describe('Floating bottom navigation', () => {
  let fixture: ComponentFixture<BottomNavigationComponent>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AppModule] });
    router = TestBed.inject(Router);
  });

  function create(): void {
    fixture = TestBed.createComponent(BottomNavigationComponent);
    fixture.detectChanges();
  }

  async function navigate(url: string): Promise<void> {
    await fixture.ngZone?.run(() => router.navigateByUrl(url));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function indicator(): HTMLElement {
    return fixture.nativeElement.querySelector('[data-active-indicator]');
  }

  function finishSlide(): void {
    gsap.getTweensOf(indicator()).forEach(tween => tween.totalProgress(1));
  }

  it('positions the indicator immediately for a direct URL, including query and fragment', async () => {
    await router.navigateByUrl('/products?preview=true#main-content');
    create();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(Number(gsap.getProperty(indicator(), 'xPercent'))).toBe(200);
    const active = fixture.nativeElement.querySelector('a[aria-current="page"]');
    expect(active?.getAttribute('aria-label')).toBe('Stock');
    expect(fixture.nativeElement.querySelectorAll('a').length).toBe(4);
  });

  it('tracks router navigation and redirects without requiring a tap', async () => {
    create();
    for (const [url, index] of [['/more', 3], ['/more/stock-movements?preview=true#main-content', 3], ['/history', 3], ['/returns?preview=true#main-content', 3], ['/sales?source=preview#main-content', 1], ['/unknown', 0]] as const) {
      await navigate(url);
      finishSlide();
      expect(Number(gsap.getProperty(indicator(), 'xPercent'))).toBe(index * 100);
      expect(fixture.nativeElement.querySelectorAll('a[aria-current="page"]').length).toBe(1);
    }
  });

  it('shows only the selected destination as solid and restores other icons to outlines', async () => {
    create();
    for (const item of fixture.componentInstance.items) {
      await navigate(`${item.path}?preview=true#main-content`);
      const active: HTMLElement = fixture.nativeElement.querySelector('a[aria-current="page"]');
      const names = fixture.debugElement.queryAll(By.directive(LucideAngularComponent))
        .map(icon => (icon.componentInstance as LucideAngularComponent).name);
      expect(names.filter(name => typeof name === 'string' && name.endsWith('-solid'))).toEqual([item.solidIcon]);
      expect(active.querySelector('svg [fill="currentColor"]')).not.toBeNull();
      expect(active.textContent).toContain(item.label);
    }
  });

  it('reuses press animations under rapid taps and never delays routing', async () => {
    create();
    const surface: HTMLElement = fixture.nativeElement.querySelector('[data-press-surface]');
    const originalTweens = gsap.getTweensOf(surface);
    for (let index = 0; index < 20; index++) fixture.componentInstance.press(0);
    expect(gsap.getTweensOf(surface)).toEqual(originalTweens);
    expect(originalTweens.length).toBe(2);
    const timeline = originalTweens[0].parent;
    timeline?.totalTime(0.08);
    expect(Number(gsap.getProperty(surface, 'scaleX'))).toBeCloseTo(0.96, 2);
    timeline?.totalProgress(1);
    expect(surface.style.transform).toBe('');
    fixture.nativeElement.querySelector('a[href="/sales"]').click();
    await fixture.whenStable();
    expect(router.url).toBe('/sales');
  });

  it('uses immediate selection and no press movement for reduced motion', async () => {
    const actualMatchMedia = window.matchMedia.bind(window);
    const reduced = jasmine.createSpyObj<MediaQueryList>('reduced', ['addListener', 'removeListener'], { matches: true });
    spyOn(window, 'matchMedia').and.callFake(query => query === '(prefers-reduced-motion: reduce)' ? reduced : actualMatchMedia(query));
    create();
    await navigate('/returns');
    expect(Number(gsap.getProperty(indicator(), 'xPercent'))).toBe(300);
    fixture.componentInstance.press(0);
    const surface: HTMLElement = fixture.nativeElement.querySelector('[data-press-surface]');
    expect(surface.style.transform).toBe('');
    expect(gsap.getTweensOf(surface).length).toBe(0);
  });

  it('keeps geometry and usable links when native blur is disabled', () => {
    create();
    const pill: HTMLElement = fixture.nativeElement.querySelector('.navigation-pill');
    const before = pill.getBoundingClientRect();
    fixture.nativeElement.classList.add('opaque-navigation');
    const after = pill.getBoundingClientRect();
    expect(after.width).toBe(before.width);
    expect(after.height).toBe(before.height);
    expect(getComputedStyle(pill).getPropertyValue('backdrop-filter')).toBe('none');
    expect(fixture.nativeElement.querySelectorAll('a[href]').length).toBe(4);
    expect(fixture.nativeElement.querySelectorAll('canvas, app-liquid-glass').length).toBe(0);
  });

  it('reverts component animations and stops listening after destruction', async () => {
    create();
    await navigate('/products');
    fixture.componentInstance.press(1);
    const targets: HTMLElement[] = [indicator(), ...fixture.nativeElement.querySelectorAll('[data-press-surface]')];
    fixture.destroy();
    expect(gsap.getTweensOf(targets).length).toBe(0);
    expect(targets.every(target => target.style.transform === '')).toBeTrue();
    await router.navigateByUrl('/history');
    expect(targets.every(target => target.style.transform === '')).toBeTrue();
  });

  it('settles the current selection and releases a pressed icon when reduced motion changes', async () => {
    let reduced = false;
    const actualMatchMedia = window.matchMedia.bind(window);
    const query = jasmine.createSpyObj<MediaQueryList>('preference', ['addListener', 'removeListener']);
    Object.defineProperty(query, 'matches', { get: () => reduced });
    spyOn(window, 'matchMedia').and.callFake(value => value === '(prefers-reduced-motion: reduce)' ? query : actualMatchMedia(value));
    create();
    await navigate('/history');
    fixture.componentInstance.press(0);
    reduced = true;
    gsap.matchMediaRefresh();
    const surface: HTMLElement = fixture.nativeElement.querySelector('[data-press-surface]');
    expect(Number(gsap.getProperty(indicator(), 'xPercent'))).toBe(300);
    expect(surface.style.transform).toBe('');
    fixture.componentInstance.press(0);
    expect(gsap.getTweensOf(surface).length).toBe(0);
    await navigate('/sales');
    expect(Number(gsap.getProperty(indicator(), 'xPercent'))).toBe(100);
  });
});
