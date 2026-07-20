# Normalizacja

Normalizacja Fali 3 jest wersjonowana jako
`woocommerce-orders.mapping.2026-07`.

Zakres:

- typy, daty, waluta i kwoty;
- status mapping WooCommerce -> status kanoniczny;
- rozróżnienie braku wartości i jawnego zera przez `zeroEvidenceFields`;
- błędy `MISSING_REQUIRED_FIELD`, `INVALID_TYPE`, `INVALID_NUMBER`,
  `UNKNOWN_CURRENCY`, `UNKNOWN_STATUS` i `MISSING_STABLE_EXTERNAL_ID`.

Rekordy błędne nie znikają. Tworzą evidence i `DataIssue`; nie mogą podnieść
readiness do `READY`.
