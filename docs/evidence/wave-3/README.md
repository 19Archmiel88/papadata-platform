# Dowody Fali 3

## Zakres

Dataset referencyjny: `orders`.

Provider referencyjny: WooCommerce z Fali 2.

Fakt kanoniczny: `CanonicalOrder`.

## Artefakty

- Schematy: `apps/web/src/features/data-quality/dataQualityContracts.ts`.
- Runtime pipeline: `apps/web/src/features/data-quality/localDataQualityRuntime.ts`.
- Fixture: `apps/web/src/features/data-quality/dataQualityFixtures.ts`.
- Ekran: `apps/web/src/features/data-quality/DataQualityCenterScreen.tsx`.
- Storybook: `apps/web/src/stories/data-quality/wave3-data-quality.stories.tsx`.
- Test vectors: `apps/web/src/features/data-quality/dataQualityVectors.unit.test.ts`.
- Cross-workspace tests:
  `apps/web/src/features/data-quality/dataQualityIsolation.security.test.ts`.

## Wersje reguł

- source schema: `woocommerce-orders.source.2026-07`;
- normalization mapping: `woocommerce-orders.mapping.2026-07`;
- status mapping: `woocommerce-status.mapping.2026-07`;
- source authority: `authority.woocommerce-orders.2026-07`;
- exact matching: `exact-match.order-number.2026-07`;
- fuzzy matching: `fuzzy.disabled.2026-07`;
- deduplication: `dedupe.exact-order-number.2026-07`;
- canonical schema: `canonical-order.v1`;
- quality rules: `quality.orders.mvp.2026-07`;
- readiness rules: `readiness.orders.mvp.2026-07`;
- reconciliation tolerance: `reconciliation.orders.0-01.2026-07`;
- reprocessing policy: `reprocess.dataset-versioned.2026-07`;
- deletion ledger: `deletion-ledger.2026-07`.

## Wyniki testów

Ostatnie wyniki podczas implementacji:

- `pnpm --filter @papadata/web typecheck` — zielone.
- `pnpm --filter @papadata/web test:auth` — 20 plików, 91 testów, zielone.
- `pnpm --filter @papadata/web test:storybook` — 52 pliki, 243 testy,
  zielone.

Pełna weryfikacja końcowa jest raportowana w
`docs/implementation-reports/wave-3-report.md`.
