import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoothStockComponent } from './pages/booth-stock/booth-stock.component';
import { CheckOutComponent } from './pages/check-out/check-out.component';

const routes: Routes = [
  { path: '', component: BoothStockComponent, title: 'Stock | PK Counter' },
  { path: 'check-out', component: CheckOutComponent, title: 'Check Out | PK Counter', data: { hideNavigation: true } },
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class BoothStockRoutingModule {}
