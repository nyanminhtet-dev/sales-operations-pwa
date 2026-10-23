import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';

describe('Application layout', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [AppModule],
  }));

  it('creates the app with the shared header, outlet and navigation', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(element.querySelector('header')?.textContent).toContain('PK Counter');
    expect(element.querySelector('main router-outlet')).not.toBeNull();
    expect(element.querySelectorAll('nav a').length).toBe(4);
    expect(element.querySelectorAll('nav lucide-icon[aria-hidden="true"] svg').length).toBe(4);
    expect(element.querySelector('header lucide-icon[name="user-round"] svg')).not.toBeNull();
    expect(element.querySelector<HTMLButtonElement>('button[aria-label="Profile (coming soon)"]')?.disabled).toBeTrue();
  });

  for (const [label, path] of [['Home', 'home'], ['Sales', 'sales'], ['Stock', 'products'], ['More', 'more']] as const) {
    it(`navigates to ${label} and marks only that destination active`, async () => {
      const fixture = TestBed.createComponent(AppComponent);
      const router = TestBed.inject(Router);
      fixture.detectChanges();
      await fixture.ngZone?.run(() => router.navigateByUrl('/home'));
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      const destination = element.querySelector<HTMLAnchorElement>(`nav a[href="/${path}"]`);
      destination?.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(router.url).toBe(`/${path}`);
      expect(element.querySelector('a')?.getAttribute('href')).toBe(`/${path}#main-content`);
      expect(element.querySelector('main h1')?.textContent).toBe(['Home', 'Sales', 'Stock'].includes(label) ? label : `${label} — layout preview`);
      const activeLinks = element.querySelectorAll('nav a[aria-current="page"]');
      expect(activeLinks.length).toBe(1);
      expect(activeLinks[0]?.textContent).toContain(label);
      expect(activeLinks[0]?.classList.contains('is-active')).toBeTrue();
      expect(element.querySelector('header')).not.toBeNull();
      expect(element.querySelector('app-header') !== null).toBe(!['Sales', 'Stock'].includes(label));
      expect(element.querySelector('header .header-crowd') !== null).toBe(label === 'Home');
    });
  }

  it('selects the feature header for a direct Sales URL and restores Home branding afterwards', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.ngZone?.run(() => router.navigateByUrl('/sales?preview=true#main-content'));
    await fixture.whenStable();
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('app-header')).toBeNull();
    expect(element.querySelector('img[src="assets/main-logo.png"]')).toBeNull();
    expect(element.querySelector('[aria-label="Profile (coming soon)"]')).toBeNull();
    expect(element.querySelector('app-sales header h1')?.textContent).toBe('Sales');
    expect(element.querySelector('nav a[aria-current="page"]')?.getAttribute('href')).toBe('/sales');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/sales?preview=true#main-content');

    await fixture.ngZone?.run(() => router.navigateByUrl('/home'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(element.querySelector('app-sales')).toBeNull();
    expect(element.querySelector('app-header')).not.toBeNull();
    expect(element.querySelector('header .header-crowd')).not.toBeNull();
    expect(element.querySelector('header [aria-label="Profile (coming soon)"]')).not.toBeNull();
  });

  for (const label of ['History', 'Returns']) {
    it(`opens ${label} from More and keeps More selected`, async () => {
      const fixture = TestBed.createComponent(AppComponent);
      const router = TestBed.inject(Router);
      fixture.detectChanges();
      await fixture.ngZone?.run(() => router.navigateByUrl('/more'));
      await fixture.whenStable();
      fixture.detectChanges();
      const element: HTMLElement = fixture.nativeElement;
      expect(element.querySelector(`nav a[href="/${label.toLowerCase()}"]`)).toBeNull();
      element.querySelector<HTMLAnchorElement>(`main a[href="/${label.toLowerCase()}"]`)?.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(router.url).toBe(`/${label.toLowerCase()}`);
      expect(element.querySelector('nav a[aria-current="page"]')?.getAttribute('href')).toBe('/more');
      expect(element.querySelector('main h1')?.textContent).toBe(`${label} — layout preview`);
      element.querySelector<HTMLAnchorElement>('main a[href="/more"]')?.click();
      await fixture.whenStable();
      expect(router.url).toBe('/more');
    });
  }

  it('keeps the current destination active with query parameters and a content fragment', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.ngZone?.run(() => router.navigateByUrl('/products?preview=true#main-content'));
    await fixture.whenStable();
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const activeLinks = element.querySelectorAll('nav a[aria-current="page"]');
    expect(activeLinks.length).toBe(1);
    expect(activeLinks[0]?.getAttribute('href')).toBe('/products');
    expect(activeLinks[0]?.classList.contains('is-active')).toBeTrue();
  });

  it('opens stock movement history from Stock and More while selecting More', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.ngZone?.run(() => router.navigateByUrl('/products'));
    await fixture.whenStable(); fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLAnchorElement>('main a[href="/more/stock-movements"]')?.click();
    await fixture.whenStable(); fixture.detectChanges();
    expect(router.url).toBe('/more/stock-movements');
    expect(element.querySelector('main h1')?.textContent).toBe('Stock movement history');
    expect(element.querySelector('nav [aria-current="page"]')?.getAttribute('href')).toBe('/more');
    expect(element.querySelector('app-header')).toBeNull();
    element.querySelector<HTMLAnchorElement>('main a[href="/more"]')?.click();
    await fixture.whenStable(); fixture.detectChanges();
    expect(router.url).toBe('/more');
    expect(element.querySelector('main a[href="/more/stock-movements"]')?.textContent).toContain('Stock movement history');
    await fixture.ngZone?.run(() => router.navigateByUrl('/more/stock-movements?preview=true#main-content'));
    await fixture.whenStable(); fixture.detectChanges();
    expect(element.querySelector('nav [aria-current="page"]')?.getAttribute('href')).toBe('/more');
    expect(element.querySelectorAll('app-stock-movement-history li').length).toBe(3);
  });

  it('keeps the decorative Home background with query parameters and a fragment', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.ngZone?.run(() => router.navigateByUrl('/home?preview=true#main-content'));
    await fixture.whenStable();
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const background = element.querySelector<HTMLImageElement>('header .header-crowd');
    expect(background?.getAttribute('src')).toBe('assets/home-header-crowd.png');
    expect(background?.alt).toBe('');
    expect(background?.getAttribute('aria-hidden')).toBe('true');
    expect(element.querySelector('header a')?.getAttribute('aria-label')).toBe('PK Counter home');
  });

  it('opens Check Out from Stock without duplicate navigation and restores Stock on return', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.ngZone?.run(() => router.navigateByUrl('/products'));
    await fixture.whenStable(); fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLAnchorElement>('a[href="/products/check-out"]')?.click();
    await fixture.whenStable(); fixture.detectChanges();
    expect(router.url).toBe('/products/check-out');
    expect(element.querySelector('app-check-out h1')?.textContent).toBe('Check Out');
    expect(element.querySelector('app-header')).toBeNull();
    expect(element.querySelector('app-bottom-navigation')).toBeNull();
    expect(element.querySelectorAll('app-check-out footer').length).toBe(0);
    element.querySelector<HTMLButtonElement>('app-check-out button[aria-label="Back to Stock"]')?.click();
    await fixture.whenStable(); fixture.detectChanges();
    expect(router.url).toBe('/products');
    expect(element.querySelector('nav [aria-current="page"]')?.getAttribute('aria-label')).toBe('Stock');
  });

  for (const path of ['/', '/unknown']) {
    it(`redirects ${path} to Home`, async () => {
      const fixture = TestBed.createComponent(AppComponent);
      const router = TestBed.inject(Router);
      fixture.detectChanges();
      await fixture.ngZone?.run(() => router.navigateByUrl(path));
      await fixture.whenStable();
      expect(router.url).toBe('/home');
    });
  }

  it('fades the header glass over the stationary Home artwork when scrolling', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const router = TestBed.inject(Router);
    fixture.detectChanges();
    await fixture.ngZone?.run(() => router.navigateByUrl('/home'));
    await fixture.whenStable();
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const content = element.querySelector<HTMLElement>('main');
    const header = element.querySelector('header');
    if (!content || !header) throw new Error('Missing application layout');
    const crowd = element.querySelector('header .header-crowd');
    const originalGlass = element.querySelector('.header-glass');
    expect(originalGlass?.classList.contains('opacity-0')).toBeTrue();

    // Supply scroll position independently of the test runner viewport height.
    Object.defineProperty(content, 'scrollTop', { value: 100, writable: true });
    content.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    const glass = element.querySelector('.header-glass');
    expect(glass).toBe(originalGlass);
    expect(glass?.classList.contains('opacity-100')).toBeTrue();
    expect(glass?.classList.contains('backdrop-blur-md')).toBeTrue();
    expect(header.classList.contains('backdrop-blur-md')).toBeFalse();
    expect(element.querySelector('header .header-crowd')).toBe(crowd);
    expect(element.querySelectorAll('header img[src="assets/home-header-crowd.png"]').length).toBe(1);
    expect(glass?.contains(crowd)).toBeFalse();
    expect(element.querySelectorAll('nav a').length).toBe(4);

    content.scrollTop = 0;
    content.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();
    expect(element.querySelector('.header-glass')).toBe(originalGlass);
    expect(originalGlass?.classList.contains('opacity-0')).toBeTrue();
    expect(element.querySelector('header .header-crowd')).toBe(crowd);
  });
});
