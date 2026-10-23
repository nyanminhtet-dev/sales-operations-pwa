# Booth Stock UI prototype

The lazy BoothStockModule lives in features/booth-stock and uses SharedModule.
The existing /products URL, Stock navigation selection and Home links are preserved.
No Home, Sales catalogue or global navigation behavior changes are required.

config/booth-stock.mock.ts is the single static fixture source. Its six variants
hold 248 units; three have fewer than the demo threshold of 15 units. Activities
on the fixed demo day (22 October 2026, Myanmar time) contain 12 units sold,
24 checked out and 2 checked in. Summary figures and row labels are derived from
these records. Values describe a prototype, not current/live inventory.

The sample product photographs reuse assets/products/mock; attribution remains
in that asset directory. Failed thumbnails use the centralized cube icon.
Rows expand to show demo variant details. Check Out opens the four-screen demo;
Check In announces a demo notice. Neither changes inventory or sends requests. There is no data service,
API integration, permission handling, loading delay or model/interface layer.
The former unavailable-state service and its tests have been removed.

A real implementation still needs confirmed authenticated booth ownership,
stock and movement contracts, reporting periods, thresholds, permissions and
validated transfer workflows. Do not treat this fixture shape as an API contract.

Recent stock movements links to /more/stock-movements, also available from More.
StockMovementHistoryModule is a separate lazy entry within this feature, keeping
stock display/data ownership here while More stays selected for that destination.
Both views use BOOTH_STOCK_MOVEMENTS, the same derived fixture projection.
Stock typography follows the existing pages: 14px row/action labels, 12px metadata,
14px section headings (16px on larger screens), and the existing 24px page title.

## Check Out demo

/products/check-out opens the local four-screen Check Out prototype. It uses
config/check-out.mock.ts for shared-pool availability and its single demo booth,
Main Booth (Central Mall), independently of the Stock overview's Yangon fixture.
No assignment change or permission model is implied by the demo booth selector.

Selection and Reactive Forms quantity controls stay inside CheckOutComponent.
Quantities must be positive whole numbers within mock availability. Selection
survives in-page back/edit steps and resets when the route is destroyed. The
success receipt snapshots current quantities with a DEMO reference and fixed
mock timestamp. It never changes holdings, shared-pool availability or movement
history; View in Stock Movements opens the existing unchanged demo history.

The route's hideNavigation flag removes the main navigation and its usual bottom
padding only during this workflow. One fixed, safe-area-aware action footer takes
its place; the page owns the matching bottom clearance. The existing lavender
background appearance is preserved in each page's local stylesheet. No API,
persistence, new animation or dependency is added by the folder refactor.

### Product browsing and variant selection

CheckOutCatalogService is the replaceable, synchronous demo catalogue boundary.
The config groups nine demo variants into five parent products, including
Black/Gray hoodies with illustrative quantities of 24/18. Grouping, option labels
and SKUs are prototype metadata; they do not define an API contract. Photos belong to parent
product galleries. Each currently has one verified remote sample photo, independent
of the chosen color; missing/failed photos use the cube fallback.

CheckOutProductDetailComponent is an integrated detail view within the existing
route. The page retains the selected booth, filters, list scroll position and
variant selections; returning focuses the originating product. Only real
color/size combinations can resolve to a variant. Ambiguous combinations
require explicit SKU selection. Quantities account for units already selected;
adding accumulates by variant ID rather than resetting an existing quantity.

The fixture has no sale prices, statuses, barcode or product descriptions.
Those fields are not fabricated: prices and monetary totals show unavailable,
while stock transfer counts retain their existing meaning. Known future demo
prices can be rendered without treating missing prices as zero. Starting prices
require an explicitly active variant with a valid price. An omitted status
preserves the existing demo receiving behavior; an explicitly inactive variant
cannot be added. The single demo booth cannot switch warehouse context.

The catalogue UI includes loading, retryable error and empty states for replacing
the demo boundary. There is no artificial network delay or separate detail
request: details use the already loaded parent and its variants. A real API
still requires confirmed product relationships, gallery, prices, availability,
statuses and warehouse contracts before production integration.

### Sample photo sources

All selected HTTPS image URLs were opened and visually verified in the browser
on 23 October 2026. The 900×900, quality-80 URLs are stored only in the demo
parent-product galleries and reused by every variant. List thumbnails use cover;
the main detail image uses contain. Noncritical images are lazy-loaded and failed
images retain the existing fallback. These are illustrative photos, not official
PK Counter branding or exact color previews. No production database/API is changed.

| Product | Photographer / source | Direct image URL |
| --- | --- | --- |
| PK Logo Tee | [Haryo Setyadi](https://unsplash.com/photos/white-crew-neck-t-shirt-acn5ERAeSb4) | https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&crop=bottom&w=900&h=900&q=80 |
| PC Cap | [Mediamodifier](https://unsplash.com/photos/white-baseball-cap-on-white-surface-t8HiP3e5abg) | https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&crop=center&w=900&h=900&q=80 |
| PC Tote Bag | [Simply Mersah](https://unsplash.com/photos/a-brown-bag-sitting-on-top-of-a-white-table-iFSsBIHXFR8) | https://images.unsplash.com/photo-1732963574895-f4b6af2dec06?auto=format&fit=crop&crop=center&w=900&h=900&q=80 |
| PK Hoodie | [Mediamodifier](https://unsplash.com/photos/kJXGTOY1wLQ) | https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&crop=center&w=900&h=900&q=80 |
| PK Keychain | [Muhammet SAIN](https://unsplash.com/photos/a-keychain-with-a-leather-tag-attached-to-it-7ApjiItz0co) | https://images.unsplash.com/photo-1676488690948-8020c4851c50?auto=format&fit=crop&crop=center&w=900&h=900&q=80 |

No selected image URL remains unverified. Search-fetcher failures were checked
in the browser instead. Candidates with unsuitable subjects or visible branding
were excluded rather than used as unrelated replacements. Future remote failures
remain possible; fallback behavior does not swap in another product's photograph.
