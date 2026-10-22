// Static UI fixtures only: no API contract, real booth assignment or live stock.
// Photos are existing sample assets, not images of actual PK merchandise.
export const BOOTH_STOCK_MOCK: any = {
  booth: 'Yangon Main Booth',
  reportingDate: '2026-10-22',
  lowStockThreshold: 15,
  variants: [
    { id: 'cap-black', name: 'PK Cap', variant: 'Black', sku: 'DEMO-CAP-BLK', available: 3, image: 'assets/products/mock/pk-cap.jpg' },
    { id: 'tote-beige', name: 'PK Tote Bag', variant: 'Beige', sku: 'DEMO-TOTE-BGE', available: 5, image: 'assets/products/mock/pk-tote.jpg' },
    { id: 'tee-white', name: 'PK Logo Tee', variant: 'White', sku: 'DEMO-TEE-WHT', available: 4, image: 'assets/products/mock/pk-shirt.jpg' },
    { id: 'hoodie-black', name: 'PK Hoodie', variant: 'Black', sku: 'DEMO-HOD-BLK', available: 64, image: 'assets/products/mock/pk-hoodie.jpg' },
    { id: 'light-stick-purple', name: 'PK Light Stick', variant: 'Purple', sku: 'DEMO-LS-PUR', available: 80, image: 'assets/products/mock/pk-light-stick.jpg' },
    { id: 'keychain-black', name: 'PK Keychain', variant: 'Black', sku: 'DEMO-KEY-BLK', available: 92, image: 'assets/products/mock/pk-keychain.jpg' },
  ],
  movements: [
    { id: 'movement-out', type: 'out', at: '2026-10-22T11:00:00+06:30', lines: [{ variantId: 'hoodie-black', units: 24 }] },
    { id: 'movement-in', type: 'in', at: '2026-10-22T10:15:00+06:30', lines: [{ variantId: 'tote-beige', units: 2 }] },
    { id: 'movement-sale', type: 'sold', at: '2026-10-22T09:30:00+06:30', lines: [{ variantId: 'cap-black', units: 4 }, { variantId: 'tee-white', units: 8 }] },
  ],
};

// Shared display projection for the Stock preview and its full history page.
export const BOOTH_STOCK_MOVEMENTS: any[] = BOOTH_STOCK_MOCK.movements.map((movement: any) => {
  const presentation: any = {
    out: { label: 'Checked out', icon: 'arrow-up-right', sign: '+', style: 'text-brand bg-brand-soft' },
    in: { label: 'Checked in', icon: 'arrow-down-right', sign: '-', style: 'text-positive bg-green-50' },
    sold: { label: 'Sold', icon: 'shopping-cart', sign: '-', style: 'text-brand bg-brand-soft' },
  };
  return {
    ...movement, ...presentation[movement.type],
    units: movement.lines.reduce((sum: number, line: any) => sum + line.units, 0),
    productLabel: movement.lines.map((line: any) => {
      const item = BOOTH_STOCK_MOCK.variants.find((variant: any) => variant.id === line.variantId);
      return `${item.name} - ${item.variant}`;
    }).join(' · '),
  };
}).sort((a: any, b: any) => b.at.localeCompare(a.at));
