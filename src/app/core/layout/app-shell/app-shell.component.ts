import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  headerScrolled = false;

  readonly layout$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    startWith(null),
    map(() => ({ featureHeader: this.hasFeatureHeader() })),
  );

  constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute) {}

  private hasFeatureHeader(): boolean {
    let route: ActivatedRoute | null = this.activatedRoute.root;
    let featureHeader = false;
    while (route) {
      if (route.snapshot.data['header']) featureHeader = route.snapshot.data['header'] === 'feature';
      route = route.firstChild;
    }
    return featureHeader;
  }

  get contentLink(): string {
    // Include the current route because the document base URL is '/'.
    return `${this.router.url.split('#')[0]}#main-content`;
  }
}
