import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { gsap } from 'gsap';
import { catchError, map, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { DashboardDataService } from '../../services/dashboard-data.service';

type DashboardState =
  | { readonly status: 'loading'; readonly data?: undefined }
  | { readonly status: 'ready'; readonly data: any }
  | { readonly status: 'error'; readonly data?: undefined };

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements AfterViewInit, AfterViewChecked, OnDestroy {
  readonly assignedLocation = this.dashboardData.demoAssignedLocation;

  @ViewChild('pageContent', { static: true }) private pageContent?: ElementRef<HTMLElement>;
  @ViewChild('salesCard') private salesCard?: ElementRef<HTMLElement>;

  private motionContext?: gsap.Context;
  private motionMedia?: gsap.MatchMedia;
  private entranceInitialized = false;
  private cardContext?: gsap.Context;
  private cardMedia?: gsap.MatchMedia;
  private cardEntranceInitialized = false;
  private readonly refresh$ = new Subject<void>();

  readonly state$: Observable<DashboardState> = this.refresh$.pipe(
    startWith(undefined),
    switchMap(() => this.dashboardData.load().pipe(
      map(data => ({ status: 'ready' as const, data: this.withSalesSummary(data) })),
      startWith({ status: 'loading' as const }),
      catchError(() => of({ status: 'error' as const })),
    )),
  );

  constructor(private readonly dashboardData: DashboardDataService) {}

  private withSalesSummary(data: any): any {
    const total = Number.isFinite(data?.totalSales) && data.totalSales >= 0 ? data.totalSales : null;
    const count = Number.isInteger(data?.transactionCount) && data.transactionCount >= 0 ? data.transactionCount : null;
    const items = Number.isInteger(data?.itemsSold) && data.itemsSold >= 0 ? data.itemsSold : null;
    const previous = data?.previousPeriodSales;
    const period = typeof data?.comparisonPeriodLabel === 'string' ? data.comparisonPeriodLabel.trim() : '';
    const change = total !== null && Number.isFinite(previous) && previous > 0 && period
      ? ((total - previous) / previous) * 100
      : null;
    const trend = change !== null && Number.isFinite(change) ? change : null;

    return {
      ...data,
      summary: {
        total,
        count,
        items,
        average: total !== null && count !== null && count > 0 ? total / count : null,
        trend,
        trendPrefix: trend !== null && trend > 0 ? '+' : '',
        trendIcon: trend === null || trend === 0 ? 'minus' : trend > 0 ? 'arrow-up-right' : 'arrow-down-right',
        comparison: trend === null ? 'Comparison unavailable' : `Compared with ${period}`,
      },
    };
  }

  ngAfterViewInit(): void {
    const root = this.pageContent?.nativeElement;
    if (!root) return;

    this.motionContext = gsap.context(() => {
      this.motionMedia = gsap.matchMedia();
      this.motionMedia.add({
        always: 'all',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      }, media => {
        // Preference changes restore visible content without replaying the entrance.
        if (this.entranceInitialized) return;
        this.entranceInitialized = true;
        if (media.conditions?.['reduceMotion']) return;

        gsap.fromTo('[data-entrance]', { opacity: 0, y: 8 }, {
          opacity: 1,
          y: 0,
          duration: 0.22,
          stagger: 0.04,
          ease: 'power1.out',
          clearProps: 'opacity,transform',
        });
      }, root);
    }, root);
  }

  ngAfterViewChecked(): void {
    const card = this.salesCard?.nativeElement;
    if (!card && this.cardContext) {
      this.cardMedia?.revert();
      this.cardContext.revert();
      this.cardContext = undefined;
    }
    if (!card || this.cardContext) return;
    // The ready card is rendered asynchronously, after the page's initial view.
    this.cardContext = gsap.context(() => {
      this.cardMedia = gsap.matchMedia();
      this.cardMedia.add({ always: 'all', reduceMotion: '(prefers-reduced-motion: reduce)' }, media => {
        if (this.cardEntranceInitialized) return;
        this.cardEntranceInitialized = true;
        if (media.conditions?.['reduceMotion']) return;
        gsap.fromTo(card, { opacity: 0, y: 8 }, {
          opacity: 1, y: 0, duration: 0.22, ease: 'power1.out', clearProps: 'opacity,transform',
        });
      }, card);
    }, card);
  }

  ngOnDestroy(): void {
    this.cardMedia?.revert();
    this.cardContext?.revert();
    this.motionMedia?.revert();
    this.motionContext?.revert();
  }

  retry(): void {
    this.refresh$.next();
  }
}
