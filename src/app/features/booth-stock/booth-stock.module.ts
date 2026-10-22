import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { BoothStockRoutingModule } from './booth-stock-routing.module';
import { BoothStockComponent } from './pages/booth-stock.component';

@NgModule({
  declarations: [BoothStockComponent],
  imports: [SharedModule, BoothStockRoutingModule],
})
export class BoothStockModule {}
