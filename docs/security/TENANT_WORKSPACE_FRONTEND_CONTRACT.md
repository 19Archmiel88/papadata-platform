# Tenant And Workspace Frontend Contract

Status: draft techniczny.
Źródła prawdy: `AGENTS.md`, `docs/spec/domain-contracts.md`,
`docs/spec/security.md`.

## Contract

Każde wywołanie danych musi zachować:

- `tenantId`;
- `workspaceId`;
- `correlationId`;
- `contractVersion`;
- capability wymagane dla operacji.

Backend jest źródłem decyzji bezpieczeństwa. Frontend może filtrować UI, ale
nie może uznać operacji za autoryzowaną bez walidacji backendu.

## Current Implementation

Repo nie używa React Query. Aktualny runtime frontendowy:

- tworzy token requestu przez `beginWorkspaceRequest`;
- zapisuje `tenantId`, `workspaceId` i `generation`;
- zwiększa `generation` po zmianie workspace;
- czyści cache, drafty i streamy po zmianie workspace;
- odrzuca starą odpowiedź jako `late_response`.

Test referencyjny: `apps/web/src/shell/sessionContext.security.test.ts`.

## Future React Query Rule

Jeżeli zostanie dodany React Query, każdy query key musi zawierać:

```text
[contractVersion, tenantId, workspaceId, resourceName, filtersVersion]
```

Przy zmianie workspace należy anulować zapytania starego scope, invalidować
cache scope i ignorować odpowiedzi, których token requestu nie pasuje do
aktualnego `tenantId`, `workspaceId` i `generation`.

## Forbidden

- globalny cache bez `tenantId` i `workspaceId`;
- reuse odpowiedzi starego workspace;
- storage browserowy z danymi tenant/workspace bez walidacji backendu;
- endpointy zależne wyłącznie od wyboru w UI.
