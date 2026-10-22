import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { gsap } from 'gsap';

@Component({
  selector: 'app-mini-sales-chart',
  template: `
    <div class="flex h-10 items-end gap-1.5" aria-hidden="true">
      <ng-container *ngIf="heights.length; else empty">
        <span *ngFor="let height of heights; trackBy: trackByIndex"
          [style.height.%]="height"
          data-sales-bar class="min-w-0 flex-1 origin-bottom rounded-t-sm bg-gradient-to-t from-brand/15 to-brand/60"></span>
      </ng-container>
      <ng-template #empty>
        <span class="mb-1 h-px w-full bg-border"></span>
      </ng-template>
    </div>
  `,
  host: { 'aria-hidden': 'true', class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniSalesChartComponent implements AfterViewInit, OnDestroy {
  heights: number[] = [];
  private motionContext?: gsap.Context;
  private motionMedia?: gsap.MatchMedia;
  private entranceInitialized = false;

  constructor(private readonly element: ElementRef<HTMLElement>) {}

  @Input() set values(values: any) {
    const safeValues: number[] = Array.isArray(values)
      ? values.map(value => Number.isFinite(value) && value > 0 ? value : 0)
      : [];
    const maximum = safeValues.reduce((highest, value) => Math.max(highest, value), 0);
    const heights = maximum > 0 ? safeValues.map(value => (value / maximum) * 100) : [];
    if (heights.length === this.heights.length && heights.every((height, index) => height === this.heights[index])) return;
    // A real trend update interrupts the entrance and shows the new proportions immediately.
    // Equivalent inputs and unrelated change detection leave the entrance alone.
    this.motionMedia?.revert();
    this.motionContext?.revert();
    this.heights = heights;
  }

  ngAfterViewInit(): void {
    const root = this.element.nativeElement;
    this.motionContext = gsap.context(() => {
      this.motionMedia = gsap.matchMedia();
      this.motionMedia.add({ always: 'all', reduceMotion: '(prefers-reduced-motion: reduce)' }, media => {
        if (this.entranceInitialized) return;
        this.entranceInitialized = true;
        if (media.conditions?.['reduceMotion'] || !this.heights.length) return;
        // CSS owns the data-driven height; GSAP only reveals it with a bottom-origin transform.
        gsap.fromTo('[data-sales-bar]', { scaleY: 0 }, {
          scaleY: 1,
          duration: 0.4,
          stagger: { amount: 0.15, from: 'start' },
          ease: 'power1.out',
          clearProps: 'transform',
        });
      }, root);
    }, root);
  }

  ngOnDestroy(): void {
    this.motionMedia?.revert();
    this.motionContext?.revert();
  }

  trackByIndex(index: number): number {
    return index;
  }
}
