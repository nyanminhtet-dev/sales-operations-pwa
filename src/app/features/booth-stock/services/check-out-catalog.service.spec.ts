import { CheckOutCatalogService } from './check-out-catalog.service';
import { CHECK_OUT_MOCK } from '../config/check-out.mock';

describe('Check Out demo catalogue boundary', () => {
  const catalog = new CheckOutCatalogService();

  it('groups nine variants into five parents with parent-owned photos and unknown prices', () => {
    catalog.loadProducts().subscribe(products => {
      expect(products.length).toBe(5);
      expect(products.reduce((sum, product) => sum + product.variants.length, 0)).toBe(9);
      expect(products[0].variants.map((item: any) => item.id)).toEqual(['tee-white', 'tee-black']);
      expect(products.every(product => product.image === product.images[0])).toBeTrue();
      expect(products.every(product => product.startingPrice === null)).toBeTrue();
      expect(products.find(product => product.id === 'hoodie').variants.map((item: any) => item.color)).toEqual(['Black', 'Gray']);
      expect(products.every(product => product.images.every((url: string) => url.startsWith('https://images.unsplash.com/')))).toBeTrue();
      expect(CHECK_OUT_MOCK.variants.every((variant: any) => !variant.image && !variant.images)).toBeTrue();
    });
  });

  it('calculates a starting price only from active variants with known valid prices', () => {
    const original = CHECK_OUT_MOCK.variants;
    try {
      CHECK_OUT_MOCK.variants = [
        { productId: 'tee', status: 'active', salePrice: 300 },
        { productId: 'tee', status: 'active', salePrice: 200 },
        { productId: 'tee', status: 'inactive', salePrice: 1 },
        { productId: 'tee', salePrice: 2 },
        { productId: 'tee', status: 'active', salePrice: -1 },
        { productId: 'tee', status: 'active', salePrice: null },
      ];
      catalog.loadProducts().subscribe(products => expect(products[0].startingPrice).toBe(200));
    } finally { CHECK_OUT_MOCK.variants = original; }
  });
});
