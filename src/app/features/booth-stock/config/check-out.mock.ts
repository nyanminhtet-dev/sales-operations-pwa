// A separate shared-pool UI fixture, never the booth's live holdings.
// Parent grouping and option labels are prototype metadata derived from the
// existing names/SKUs, not an API contract. Prices/status/barcodes remain unknown.
export const CHECK_OUT_MOCK: any = {
  source: 'Shared Stock Pool',
  destination: 'Main Booth (Central Mall)',
  boothLabel: 'Main Booth',
  reference: 'STK-CO-DEMO-001',
  at: '2026-10-22T15:35:00+06:30',
  products: [
    {
      id: 'tee', name: 'PK Logo Tee', category: 'Apparel',
      imageAlt: 'Plain white crew-neck T-shirt hanging against a textured gray wall',
      images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&crop=bottom&w=900&h=900&q=80'],
    },
    {
      id: 'cap', name: 'PC Cap', category: 'Hats',
      imageAlt: 'Unbranded white baseball cap photographed on a white background',
      images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&crop=center&w=900&h=900&q=80'],
    },
    {
      id: 'tote', name: 'PC Tote Bag', category: 'Bags',
      imageAlt: 'Brown canvas tote bag on a white table beside a window',
      images: ['https://images.unsplash.com/photo-1732963574895-f4b6af2dec06?auto=format&fit=crop&crop=center&w=900&h=900&q=80'],
    },
    {
      id: 'hoodie', name: 'PK Hoodie', category: 'Apparel',
      imageAlt: 'Plain white pullover hoodie on a hanger in a neutral interior',
      images: ['https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&crop=center&w=900&h=900&q=80'],
    },
    {
      id: 'keychain', name: 'PK Keychain', category: 'Accessories',
      imageAlt: 'Brown leather keychain with a metal ring resting on a vintage typewriter',
      images: ['https://images.unsplash.com/photo-1676488690948-8020c4851c50?auto=format&fit=crop&crop=center&w=900&h=900&q=80'],
    },
  ],
  variants: [
    { id: 'tee-white', productId: 'tee', color: 'White', size: 'S', name: 'PK Logo Tee - White', sku: 'PK-TEE-WHT-S', category: 'Apparel', available: 120 },
    { id: 'tee-black', productId: 'tee', color: 'Black', size: 'S', name: 'PK Logo Tee - Black', sku: 'PK-TEE-BLK-S', category: 'Apparel', available: 85 },
    { id: 'cap-black', productId: 'cap', color: 'Black', name: 'PC Cap - Black', sku: 'PC-CAP-BLK', category: 'Hats', available: 42 },
    { id: 'cap-white', productId: 'cap', color: 'White', name: 'PC Cap - White', sku: 'PC-CAP-WHT', category: 'Hats', available: 0 },
    { id: 'tote-beige', productId: 'tote', color: 'Beige', name: 'PC Tote Bag - Beige', sku: 'PC-TOTE-BEG', category: 'Bags', available: 56 },
    { id: 'tote-black', productId: 'tote', color: 'Black', name: 'PC Tote Bag - Black', sku: 'PC-TOTE-BLK', category: 'Bags', available: 34 },
    { id: 'keychain', productId: 'keychain', color: 'Black', name: 'PK Keychain - Black', sku: 'PK-KEY-BLK', category: 'Accessories', available: 30 },
    // Additional prototype quantities, not real shared-pool inventory.
    { id: 'hoodie-black', productId: 'hoodie', color: 'Black', size: 'M', name: 'PK Hoodie - Black', sku: 'PK-HOOD-BLK-M', category: 'Apparel', available: 24 },
    { id: 'hoodie-gray', productId: 'hoodie', color: 'Gray', size: 'M', name: 'PK Hoodie - Gray', sku: 'PK-HOOD-GRY-M', category: 'Apparel', available: 18 },
  ],
};
