import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

/** Temporary route content used only to verify the layout foundation. */
@Component({
  selector: 'app-layout-preview',
  template: `
    <h1 class="text-2xl font-semibold tracking-tight">{{ title$ | async }}</h1>
    <div *ngIf="relatedPages$ | async as pages" class="mt-6 flex flex-col gap-3">
      <a *ngFor="let related of pages; trackBy: trackByPath" [routerLink]="related.path"
        class="flex min-h-[48px] items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 font-medium text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
        <lucide-icon *ngIf="related.icon" [name]="related.icon" aria-hidden="true" [size]="20" class="h-5 w-5" />
        <span class="flex-1">{{ related.label }}</span>
        <lucide-icon name="arrow-right" aria-hidden="true" [size]="20" class="h-5 w-5" />
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutPreviewComponent {
  readonly title$ = this.route.data.pipe(map(data => `${data['title']} — layout preview`));
  readonly relatedPages$ = this.route.data.pipe(map(data => data['relatedPages']));

  constructor(private readonly route: ActivatedRoute) {}

  trackByPath(_index: number, page: any): string {
    return page.path;
  }
}
