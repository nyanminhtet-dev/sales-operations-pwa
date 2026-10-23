import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-sales-product-card',
  templateUrl: './sales-product-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesProductCardComponent {
  @Input() product: any;
  @Input() view: 'grid' | 'list' = 'grid';
  @Output() selectProduct = new EventEmitter<any>();
  imageFailed = false;
}
