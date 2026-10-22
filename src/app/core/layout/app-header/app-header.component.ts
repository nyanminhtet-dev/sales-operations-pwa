import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeaderComponent {
  @Input() scrolled = false;

  readonly showCrowd$ = this.router.events.pipe(
    filter(event => event instanceof NavigationEnd),
    map(() => this.isHomeRoute()),
    startWith(this.isHomeRoute()),
  );

  constructor(private readonly router: Router) {}

  private isHomeRoute(): boolean {
    return this.router.isActive('/home', {
      paths: 'exact',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored',
    });
  }
}
