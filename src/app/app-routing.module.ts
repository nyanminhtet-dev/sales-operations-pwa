import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPreviewComponent } from './core/layout/layout-preview/layout-preview.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', loadChildren: () => import('./features/dashboard/dashboard.module').then(module => module.DashboardModule) },
  { path: 'sales', loadChildren: () => import('./features/sales-purchases/sales-purchases.module').then(module => module.SalesPurchasesModule), data: { header: 'feature' } },
  { path: 'products', loadChildren: () => import('./features/booth-stock/booth-stock.module').then(module => module.BoothStockModule), data: { header: 'feature' } },
  { path: 'more', component: LayoutPreviewComponent, data: {
    title: 'More',
    relatedPages: [
      { path: '/history', label: 'History', icon: 'history' },
      { path: '/returns', label: 'Returns', icon: 'rotate-ccw' },
    ],
  }, title: 'More | PK Counter' },
  { path: 'returns', component: LayoutPreviewComponent, data: { title: 'Returns', relatedPages: [{ path: '/more', label: 'Back to More' }] }, title: 'Returns | PK Counter' },
  { path: 'history', component: LayoutPreviewComponent, data: { title: 'History', relatedPages: [{ path: '/more', label: 'Back to More' }] }, title: 'History | PK Counter' },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
