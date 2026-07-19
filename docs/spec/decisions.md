# Rejestr decyzji wykonawczych

## Decyzje obowiązujące

| ID                 | Temat          | Decyzja                                                                    | Status       |
| ------------------ | -------------- | -------------------------------------------------------------------------- | ------------ |
| DEC-PRD-MVP-001    | Zakres MVP     | Pełna funkcjonalność aplikacji przy ograniczonym katalogu integracji       | Zatwierdzona |
| DEC-ARCH-CLOUD-001 | Infrastruktura | Docelową platformą jest Google Cloud Platform                              | Zatwierdzona |
| DEC-ENV-PARITY-001 | Środowiska     | Local, CI, Development i Staging zachowują zgodność kontraktów z produkcją | Zatwierdzona |
| DEC-TEN-001        | Tenancy        | Tenant i Workspace są osobnymi granicami domenowymi                        | Zatwierdzona |
| DEC-AUTHZ-001      | Dostęp         | Role, capabilities i data scope; egzekwowanie backendowe                   | Zatwierdzona |
| DEC-AI-ACT-001     | AI Actions     | Działania wymagają kontroli człowieka, audytu i idempotencji               | Zatwierdzona |
| DEC-BILL-MVP-001   | Billing        | Billing, usage, entitlements i self-service należą do MVP                  | Zatwierdzona |
| DEC-INT-MVP-001    | Integracje     | Dostępny jest ograniczony katalog kompletnych integracji                   | Zatwierdzona |

## Decyzje P0 — Fala 0

- `P0-TENANT-ID-001` — kanoniczną granicą klienta jest `tenantId`, nie
  `organizationId`. Status: zatwierdzona.
- `P0-WORKSPACE-ID-001` — zasób workspace zawsze zachowuje `tenantId` oraz
  `workspaceId`. Status: zatwierdzona.
- `P0-GLOBAL-001` — zasób globalny nie zawiera `tenantId` ani `workspaceId`.
  Status: zatwierdzona.
- `P0-CONTEXT-001` — backend waliduje zgodność `tenantId` i `workspaceId`
  przed autoryzacją. Status: zatwierdzona.
- `P0-WORKSPACE-001` — zmiana workspace resetuje cache, drafty i dane
  workspace. Status: zatwierdzona.
- `P0-CONTRACT-001` — schematy TypeScript/Zod są wersjonowane jako
  `domain-contracts.v1`. Status: zatwierdzona.
- `P0-ERROR-001` — statusy procesów i klasy błędów pochodzą z centralnego
  katalogu. Status: zatwierdzona.
- `P0-DATA-001` — source, normalized, canonical, ready dataset i ready KPI są
  rozdzielone. Status: zatwierdzona.
- `P0-SLICE-001` — auth tenant/workspace jest pierwszym opisanym vertical
  slice. Status: zatwierdzona.

## Parametry wymagające decyzji

- [ ] Access token TTL.
- [ ] Refresh token TTL.
- [ ] Idle session timeout.
- [ ] Absolute session timeout.
- [ ] Metody MFA.
- [ ] Invitation TTL.
- [ ] Retencja audit logu.
- [ ] Retencja eksportów.
- [ ] Provider i region AI.
- [ ] Retencja promptów, odpowiedzi i evidence.
- [ ] Lista AI Actions dostępnych w MVP.
- [ ] Provider płatności.
