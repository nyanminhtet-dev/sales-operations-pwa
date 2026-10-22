import { Injectable } from '@angular/core';
import { defer, from, Observable } from 'rxjs';
import { SALES_CATALOGUE_MOCK } from '../config/sales-catalogue.mock';

@Injectable({ providedIn: 'root' })
export class SalesCatalogueService {
  /** Replace this explicit preview boundary once the product API is agreed. */
  load(): Observable<any> {
    return defer(() => from(Promise.resolve(SALES_CATALOGUE_MOCK)));
  }
}
