# Integracje

## Katalog MVP

- WooCommerce — dostępny jako provider pilotażowy Fali 2.
- Shopify — skatalogowany, niedostępny do czasu weryfikacji adaptera i
  środowiska.
- BaseLinker — planowany.
- Allegro — planowany.
- Google Ads — planowany.
- Meta Ads — planowany.
- Google Analytics 4 — planowany.

## Wymagania każdej integracji

- [x] Autoryzacja.
- [x] Minimalne scopes.
- [x] Connect.
- [x] Initial sync.
- [x] Incremental sync.
- [x] Backfill.
- [x] Webhook, jeżeli wspierany.
- [x] Checkpoint.
- [x] Idempotencja.
- [x] Retry.
- [x] Rate limiting.
- [x] Reconnect.
- [x] Disconnect.
- [x] Monitoring.
- [x] Audit.
- [x] Retencja.
- [x] Recovery.
- [x] Runbook.
- [x] Testy kontraktowe.
- [x] Testy E2E.

Provider spoza katalogu nie może być pokazywany jako dostępny.

## Implementacja Fali 2

Implementacja znajduje się w `apps/web/src/features/integrations`.

WooCommerce spełnia wymagania w środowisku local/CI/development. Pozostali
providerzy z katalogu MVP nie są pokazywani jako dostępni, dopóki nie przejdą
tych samych bram: adapter, środowisko, runtime availability, operational
readiness, capability, entitlement i scopes.
