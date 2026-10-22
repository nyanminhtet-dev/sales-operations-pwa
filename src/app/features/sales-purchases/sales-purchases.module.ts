import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { SalesPurchasesRoutingModule } from './sales-purchases-routing.module';
import { SalesComponent } from './pages/sales.component';
import { SalesProductCardComponent } from './components/sales-product-card.component';
import { ProductSelectionSheetComponent } from './components/product-selection-sheet.component';

@NgModule({
  declarations: [SalesComponent, SalesProductCardComponent, ProductSelectionSheetComponent],
  imports: [SharedModule, SalesPurchasesRoutingModule],
})
export class SalesPurchasesModule {}
