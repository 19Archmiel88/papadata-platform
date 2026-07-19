# Kontrakty domenowe

## Wersja

Aktualna wersja kontraktów to `domain-contracts.v1`.

Implementacja znajduje się w `apps/web/src/domain-contracts`.

## Zakres Fali 0

Fala 0 zamraża:

- kanoniczne `TenantId`;
- kanoniczne `WorkspaceId`;
- model `Tenant` i `Workspace`;
- `Membership`, `Role`, `Capability` i `Entitlement`;
- `SessionContext`;
- `Readiness`, `DataIssue`, `OperationStatus`, `ErrorEnvelope` i
  `EvidenceReference`;
- katalog statusów procesów;
- katalog klas błędów;
- kontrakt operacji asynchronicznej z `operationId`;
- wersjonowane `MetricDefinition`;
- `MetricSnapshot` z readiness, lineage i evidence.

## Zasoby

- zasób tenanta zawiera `tenantId`;
- zasób workspace zawiera `tenantId` oraz `workspaceId`;
- zasób globalny nie zawiera żadnego z tych identyfikatorów.

## Vertical Slice

Pierwszym vertical slice jest auth tenant/workspace:

- fixtures auth są sprawdzane schematami Zod;
- backend auth przyjmuje `tenantId` i `workspaceId`;
- backend waliduje zgodność tenant-workspace przed autoryzacją;
- odpowiedzi HTTP dodają `contractVersion`, `correlationId`, kontekst
  tenant/workspace, readiness, limitations oraz klasę błędu;
- zmiana workspace zwraca reset `cache`, `drafts` i `workspace_data`.

## Zakres Fali 1

Fala 1 dodaje fundament aplikacji w `apps/web/src`:

- `shell/` zawiera `SessionContextProvider`, hooki kontekstu workspace,
  `PermissionBoundary` i runtime guardy zmiany workspace;
- `shared/api/` zawiera klienta API z `correlationId`, wersją kontraktu,
  aktywnym `tenantId` i `workspaceId` w headers oraz redakcją danych
  wrażliwych;
- `shared/test/` zawiera kanoniczne fixture Storybooka walidowane schematami
  domenowymi;
- `shared/patterns/` zawiera wspólne wzorce UI dla workspace, readiness,
  operacji, evidence, decyzji i problemów danych;
- `features/reference-slice/` zawiera pierwszy pion end-to-end od kontekstu
  sesji do KPI, evidence, rekomendacji i decyzji człowieka.

`ApplicationSessionContext` rozszerza bazowy `SessionContext` o użytkownika,
aktywny workspace, wszystkie dostępne workspace, memberships, capabilities,
entitlements, locale, timezone, walutę i feature flags.

Klucz cache workspace jest wersjonowany i zawiera:

- `contractVersion`;
- `tenantId`;
- `workspaceId`;
- zakres cache;
- wersję danych.

Zmiana workspace w runtime:

- anuluje aktywne zapytania;
- zatrzymuje streamy;
- czyści cache;
- czyści drafty;
- odrzuca późne odpowiedzi ze starego workspace;
- zapisuje audit event bez sekretów, tokenów ani kodów MFA.

## Inwarianty danych

Testy kontraktów utrwalają zasady:

- brak danych nie oznacza zera;
- jeden fakt biznesowy zasila KPI tylko raz;
- source data nie są canonical data;
- canonical data nie są automatycznie ready dataset;
- ready dataset nie jest automatycznie ready KPI;
- readiness jest lokalne dla zakresu, okresu, waluty, tenanta i workspace.
