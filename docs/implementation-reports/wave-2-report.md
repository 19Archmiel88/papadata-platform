# Raport wdrożenia Fali 2

Data: 2026-07-20

## Zakres

Zrealizowano vertical slice integracji i jobów:

- provider catalog z bramami dostępności;
- kontrakt adaptera `integration-adapter.v1`;
- kontrakt polityki scopes `integration-policy.2026-07`;
- `IntegrationConnection` z lifecycle i Secret Store metadata;
- WooCommerce adapter dla local/CI/development;
- `SyncJob`, checkpoint, source batch, source record i outbox;
- idempotencja komend;
- retry, DLQ, replay i recovery po crashu workera;
- webhooki z podpisem, timestampem i deduplikacją;
- reconnect, scope diff i disconnect z partial revoke failure;
- izolacja tenant/workspace;
- Storybook screen dla stanów Fali 2.

## Zmienione moduły

- `apps/web/src/features/integrations`;
- `apps/web/src/stories/integrations`;
- `apps/web/src/domain-contracts/index.ts`;
- `docs/architecture`;
- `docs/runbooks`;
- `docs/spec`;
- `docs/evidence/wave-2`.

## Kryteria akceptacji

| Kryterium | Status |
| --- | --- |
| Provider niedostępny bez bram | Zrobione. |
| Connect bez wycieku sekretów | Zrobione. |
| Initial sync i checkpoint | Zrobione. |
| Incremental sync z webhooka | Zrobione. |
| Backfill | Zrobione. |
| Retry i DLQ | Zrobione. |
| Reconnect i scope changes | Zrobione. |
| Disconnect i retencja source data | Zrobione. |
| Izolacja tenant/workspace | Zrobione. |
| Audit i observability | Zrobione. |
| Storybook dla stanów UI | Zrobione. |
| Runbook providera | Zrobione. |

## Ryzyka

Fala 2 implementuje lokalny adapter i runtime testowy. Produkcyjne podłączenie
zewnętrznych providerów, realny Secret Manager, kolejka infrastrukturalna i HTTP
transport pozostają zakresem kolejnych decyzji deploymentowych.
