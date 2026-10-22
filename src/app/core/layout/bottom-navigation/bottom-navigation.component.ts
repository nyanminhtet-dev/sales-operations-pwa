import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { IsActiveMatchOptions, NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { gsap } from 'gsap';

interface NavigationItem {
  readonly label: string;
  readonly path: string;
  readonly icon: string;
  readonly solidIcon: string;
}

@Component({
  selector: 'app-bottom-navigation',
  templateUrl: './bottom-navigation.component.html',
  styleUrls: ['./bottom-navigation.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavigationComponent implements AfterViewInit, OnDestroy {
  @ViewChild('indicator', { static: true }) private indicator?: ElementRef<HTMLElement>;
  private motionContext?: gsap.Context;
  private motionMedia?: gsap.MatchMedia;
  private routeSubscription?: Subscription;
  private moveIndicator?: (position: number) => void;
  private pressAnimations: gsap.core.Timeline[] = [];
  activeIndex = 0;

  constructor(private readonly router: Router, private readonly element: ElementRef<HTMLElement>, private readonly changeDetector: ChangeDetectorRef) {
    this.activeIndex = this.currentIndex();
  }

  readonly activeMatchOptions: IsActiveMatchOptions = {
    paths: 'exact',
    queryParams: 'ignored',
    matrixParams: 'ignored',
    fragment: 'ignored',
  };

  readonly items: readonly NavigationItem[] = [
    { label: 'Home', path: '/home', icon: 'house', solidIcon: 'house-solid' },
    { label: 'Sales', path: '/sales', icon: 'shopping-cart', solidIcon: 'shopping-cart-solid' },
    { label: 'Stock', path: '/products', icon: 'box', solidIcon: 'box-solid' },
    { label: 'More', path: '/more', icon: 'more-grid', solidIcon: 'more-grid-solid' },
  ];

  ngAfterViewInit(): void {
    const indicator = this.indicator?.nativeElement;
    if (!indicator) return;
    const root = this.element.nativeElement;
    this.activeIndex = this.currentIndex();
    this.motionContext = gsap.context(() => {
      this.motionMedia = gsap.matchMedia();
      this.motionMedia.add({ always: 'all', reduceMotion: '(prefers-reduced-motion: reduce)' }, media => {
        const reduced = !!media.conditions?.['reduceMotion'];
        gsap.set(indicator, { xPercent: this.activeIndex * 100 });
        if (reduced) {
          const setPosition = gsap.quickSetter(indicator, 'xPercent');
          this.moveIndicator = position => setPosition(position);
        } else {
          this.moveIndicator = gsap.quickTo(indicator, 'xPercent', {
            duration: 0.28, ease: 'back.out(1.15)',
          });
        }
        this.pressAnimations = [];
        if (!reduced) {
          root.querySelectorAll<HTMLElement>('[data-press-surface]').forEach(surface => {
            // Reuse one timeline per icon so rapid taps cannot accumulate tweens.
            this.pressAnimations.push(gsap.timeline({ paused: true })
              .to(surface, { scale: 0.96, duration: 0.08, ease: 'power1.out' })
              .to(surface, { scale: 1, duration: 0.16, ease: 'back.out(1.2)', clearProps: 'transform' }));
          });
        }
      }, root);
    }, root);
    this.routeSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe(() => {
      const index = this.currentIndex();
      if (index === this.activeIndex) return;
      this.activeIndex = index;
      this.moveIndicator?.(index * 100);
      this.press(index);
      this.changeDetector.markForCheck();
    });
  }

  press(index: number): void {
    this.pressAnimations[index]?.restart();
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.motionMedia?.revert();
    this.motionContext?.revert();
  }

  private currentIndex(): number {
    if (this.router.isActive('/more', { ...this.activeMatchOptions, paths: 'subset' })) return 3;
    if (['/history', '/returns'].some(path => this.router.isActive(path, this.activeMatchOptions))) return 3;
    return Math.max(0, this.items.findIndex(item => this.router.isActive(item.path, this.activeMatchOptions)));
  }

  trackByPath(_index: number, item: NavigationItem): string {
    return item.path;
  }
}
