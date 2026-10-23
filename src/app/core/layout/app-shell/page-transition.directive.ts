import { Directive, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, PRIMARY_OUTLET, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { gsap } from 'gsap';

@Directive({ selector: '[appPageTransition]' })
export class PageTransitionDirective implements OnInit, OnDestroy {
  private readonly pageOrder = ['home', 'sales', 'products', 'products/check-out', 'more', 'more/stock-movements', 'history', 'returns'];
  private subscription?: Subscription;
  private preference?: MediaQueryList;
  private context?: gsap.Context;
  private snapshot?: HTMLElement;
  private frame?: number;
  private cleanupTimer?: ReturnType<typeof setTimeout>;
  private previousPath = '';
  private readonly onPreferenceChange = () => {
    if (this.preference?.matches) this.finish();
  };

  constructor(private element: ElementRef<HTMLElement>, private router: Router, private zone: NgZone) {}

  ngOnInit(): void {
    this.preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.preference.addEventListener('change', this.onPreferenceChange);
    this.subscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) this.capture(event.url);
      if (event instanceof NavigationEnd) this.enter(event.urlAfterRedirects);
      if (event instanceof NavigationCancel || event instanceof NavigationError) this.finish();
    });
  }

  private path(url: string): string {
    return this.router.parseUrl(url).root.children[PRIMARY_OUTLET]?.segments.map(segment => segment.path).join('/') ?? '';
  }

  private capture(destination: string): void {
    this.finish();
    this.previousPath = this.path(this.router.url);
    if (!this.router.navigated || this.preference?.matches || this.previousPath === this.path(destination)) return;

    const surface = this.element.nativeElement;
    // A short-lived inert visual copy lets Angular destroy the old route normally.
    // No routed components, subscriptions or business state are retained.
    const sourceNodes = [surface, ...Array.from(surface.querySelectorAll<HTMLElement>('*'))];
    const scrollPositions = sourceNodes.map(node => ({ top: node.scrollTop, left: node.scrollLeft }));
    const snapshot = surface.cloneNode(true) as HTMLElement;
    snapshot.removeAttribute('appPageTransition');
    snapshot.removeAttribute('data-page-surface');
    snapshot.setAttribute('data-page-snapshot', '');
    snapshot.setAttribute('aria-hidden', 'true');
    snapshot.inert = true;
    snapshot.style.pointerEvents = 'none';
    snapshot.style.zIndex = '10';
    const snapshotNodes = [snapshot, ...Array.from(snapshot.querySelectorAll<HTMLElement>('*'))];
    snapshotNodes.forEach(node => {
      node.removeAttribute('id');
      node.removeAttribute('name');
      node.removeAttribute('aria-current');
    });
    surface.parentElement?.appendChild(snapshot);
    snapshotNodes.forEach((node, index) => {
      const position = scrollPositions[index];
      if (position.top) node.scrollTop = position.top;
      if (position.left) node.scrollLeft = position.left;
    });
    this.snapshot = snapshot;
  }

  private enter(destination: string): void {
    const path = this.path(destination);
    if (path === this.previousPath || !this.snapshot || this.preference?.matches) {
      this.finish();
      return;
    }
    const surface = this.element.nativeElement;
    const direction = this.pageOrder.indexOf(path) < this.pageOrder.indexOf(this.previousPath) ? -1 : 1;
    const snapshot = this.snapshot;
    // Router callbacks run inside Angular; the GSAP ticker must not drive change detection.
    this.zone.runOutsideAngular(() => {
      this.context = gsap.context(() => gsap.set(surface, { xPercent: direction * 100 }), surface);
      // Angular applies the destination header and routed view before this frame.
      this.frame = requestAnimationFrame(() => {
        this.frame = undefined;
        const content = surface.querySelector('main');
        if (content) content.scrollTop = 0;
        this.context?.add(() => {
          gsap.timeline({ defaults: { duration: 0.3, ease: 'power2.inOut' }, onComplete: () => this.zone.run(() => this.finish()) })
            .to(snapshot, { xPercent: -direction * 100 }, 0)
            .to(surface, { xPercent: 0 }, 0);
        });
      });
    });
    // Also release the snapshot if the browser suspends animation frames.
    this.cleanupTimer = setTimeout(() => this.finish(), 450);
  }

  private finish(): void {
    if (this.frame !== undefined) cancelAnimationFrame(this.frame);
    if (this.cleanupTimer !== undefined) clearTimeout(this.cleanupTimer);
    this.frame = undefined;
    this.cleanupTimer = undefined;
    this.context?.revert();
    this.context = undefined;
    this.snapshot?.remove();
    this.snapshot = undefined;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.preference?.removeEventListener('change', this.onPreferenceChange);
    this.finish();
  }
}
