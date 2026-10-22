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
Rows expand to show demo variant details. Transfer buttons only announce a demo
notice; they never change quantities or send requests. There is no data service,
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
