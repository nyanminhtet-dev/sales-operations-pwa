import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

import { AppHeaderComponent } from './app-header/app-header.component';
import { AppShellComponent } from './app-shell/app-shell.component';
import { BottomNavigationComponent } from './bottom-navigation/bottom-navigation.component';
import { LayoutPreviewComponent } from './layout-preview/layout-preview.component';
import { PageTransitionDirective } from './app-shell/page-transition.directive';

@NgModule({
  declarations: [
    AppHeaderComponent,
    AppShellComponent,
    BottomNavigationComponent,
    LayoutPreviewComponent,
    PageTransitionDirective,
  ],
  imports: [
    SharedModule,
    RouterModule,
  ],
  exports: [AppShellComponent],
})
export class LayoutModule {}
