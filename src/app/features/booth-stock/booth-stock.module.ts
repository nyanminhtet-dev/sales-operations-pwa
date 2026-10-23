import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { BoothStockRoutingModule } from './booth-stock-routing.module';
import { BoothStockComponent } from './pages/booth-stock/booth-stock.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckOutComponent } from './pages/check-out/check-out.component';
import { StockVariantThumbnailComponent } from './components/stock-variant-thumbnail.component';
import { CheckOutProductDetailComponent } from './components/check-out-product-detail/check-out-product-detail.component';

@NgModule({
  declarations: [BoothStockComponent, CheckOutComponent, StockVariantThumbnailComponent, CheckOutProductDetailComponent],
  imports: [SharedModule, ReactiveFormsModule, BoothStockRoutingModule],
})
export class BoothStockModule {}
