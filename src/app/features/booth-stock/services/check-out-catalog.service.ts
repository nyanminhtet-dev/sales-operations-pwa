import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CHECK_OUT_MOCK } from '../config/check-out.mock';

// Replace this demo boundary when the shared-pool API contract is available.
@Injectable({ providedIn: 'root' })
export class CheckOutCatalogService {
  loadProducts(): Observable<any[]> {
    return of(CHECK_OUT_MOCK.products.map((product: any) => {
      const variants = CHECK_OUT_MOCK.variants.filter((variant: any) => variant.productId === product.id);
      const prices = variants.filter((variant: any) => variant.status === 'active' && this.hasPrice(variant))
        .map((variant: any) => variant.salePrice);
      return {
        ...product, variants, image: product.images?.[0],
        variantSummary: [...new Set(variants.map((variant: any) => variant.color).filter(Boolean))].join(', '),
        startingPrice: prices.length ? Math.min(...prices) : null,
      };
    }));
  }

  hasPrice(variant: any): boolean {
    return typeof variant?.salePrice === 'number' && Number.isFinite(variant.salePrice) && variant.salePrice >= 0;
  }

  canReceive(variant: any): boolean {
    // Missing status does not change the existing demo receiving behavior.
    return !!variant && (variant.status == null || variant.status === 'active') &&
      Number.isSafeInteger(variant.available) && variant.available > 0;
  }
}
