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
    map(() => this.routeLayout()),
  );

  constructor(private readonly router: Router, private readonly activatedRoute: ActivatedRoute) {}

  private routeLayout(): any {
    let route: ActivatedRoute | null = this.activatedRoute.root;
    let featureHeader = false;
    let showNavigation = true;
    while (route) {
      if (route.snapshot.data['header']) featureHeader = route.snapshot.data['header'] === 'feature';
      if (route.snapshot.data['hideNavigation'] !== undefined) showNavigation = !route.snapshot.data['hideNavigation'];
      route = route.firstChild;
    }
    return { featureHeader, showNavigation };
  }

  get contentLink(): string {
    // Include the current route because the document base URL is '/'.
    return `${this.router.url.split('#')[0]}#main-content`;
  }
}
