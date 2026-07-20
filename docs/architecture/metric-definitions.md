# Metric Definitions

Backend L2 używa katalogu `2026-05-analytics-v1` z `packages/contracts`.
Pełny opis znajduje się w
`docs/architecture/canonical-metric-catalog.md`.

Kontrakt Fali 4 znajduje się w
`apps/web/src/features/analytics/analyticsContracts.ts`.

Każda definicja KPI zawiera:

- `kpiId`;
- nazwę i opis biznesowy;
- ownera i approvera;
- wersję definicji i formuły;
- scope, źródła i datasety wejściowe;
- inclusion/exclusion rules;
- polityki statusów, refundów, anulowań, fees i FX;
- freshness threshold;
- readiness rules;
- limitations;
- zależne metryki;
- kryteria przeliczenia;
- `validFrom` i `validTo`.

Aktywne w local/CI Fali 4:

- `Order Count`;
- `Gross Revenue`;
- `Refund Value`;
- `Net Revenue`.

Jawnie gated lub blocked:

- `Marketplace Fees`;
- `Revenue After Marketplace Fees`;
- `Advertising Spend`;
- `Attributed Conversion Value`;
- `ROAS`;
- `Contribution Margin`.

`Contribution Margin` pozostaje `BLOCKED`, dopóki nie istnieją potwierdzone
koszty produktu i pozostałe wymagane koszty zmienne.

Fala 4 pozostaje implementacją referencyjną local/CI i nie zastępuje
kanonicznego katalogu L2.
