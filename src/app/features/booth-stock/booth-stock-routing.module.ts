import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoothStockComponent } from './pages/booth-stock.component';

const routes: Routes = [
  { path: '', component: BoothStockComponent, title: 'Stock | PK Counter' },
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class BoothStockRoutingModule {}
