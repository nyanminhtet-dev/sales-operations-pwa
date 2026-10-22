import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SalesComponent } from './pages/sales.component';

const routes: Routes = [{ path: '', component: SalesComponent, title: 'Sales | PK Counter' }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesPurchasesRoutingModule {}
