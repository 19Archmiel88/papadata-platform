# Guardraile bez regresji

Każdy port ze starego backendu musi spełnić wszystkie poniższe warunki.

## Architektura

- Nie omijać BFF dla sesji przeglądarkowej.
- Nie łączyć ponownie API, BFF i workera w jeden monolit.
- Nie wprowadzać bezpośrednich zależności domen na całe stare Prisma.
- Nie omijać durable ingestion pipeline przez bezpośredni zapis adaptera do tabel produktu.

## Bezpieczeństwo

- Nie ufać `x-tenant-id`, `x-workspace-id`, `x-user-id` ani capability wysłanym przez frontend.
- Scope pochodzi wyłącznie ze zweryfikowanego principal i aktywnego membership.
- Operacje uprzywilejowane wymagają MFA/step-up oraz audytu odmów.
- Webhook wymaga powiązanego `connectionId`, podpisu, identyfikatora zdarzenia i replay reservation.
- Sekrety providerów pozostają poza payloadami jobów, logami i rekordami domenowymi.
- Testowe drivery są dozwolone wyłącznie przy `NODE_ENV=test`.

## Dane

- Raw payload musi pozostać dostępny do lineage i ponownej normalizacji.
- Canonical payload nie może usuwać informacji potrzebnej do reconciliation.
- Każda tabela tenantowa wymaga polityki RLS i testu cross-tenant denial.
- Idempotency i outbox nie mogą zostać zastąpione best-effort writes.

## Wydanie i dokumentacja

- Dokumentacja capabilities jest generowana z kontrolerów i manifestu.
- `7/7` nie może oznaczać `production-ready`, dopóki brak live evidence.
- Handler compatibility-only nie może zostać opisany jako pełna implementacja domeny.
- Nie wolno usuwać pinned Actions, SBOM, skanów, podpisywania obrazów ani attestacji.
