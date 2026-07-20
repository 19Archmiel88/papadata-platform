# PapaData Platform — macierz zgodności implementacji

## Status dokumentu

- Typ: dokument realizacyjny.
- Data aktualizacji: 2026-07-20.
- Punkt bazowy audytu: `4073843`.
- Dokument porównuje aktualny stan repozytorium z dokumentacją wykonawczą.
- Dokument nie zmienia decyzji architektonicznych.
- Dokument nie jest dowodem gotowości produkcyjnej.

## Źródła

1. `docs/l2-progress.md`.
2. `docs/backend-implementation-plan.md`.
3. `docs/spec/source-of-truth.md`.
4. `docs/spec/domain-contracts.md`.
5. `docs/spec/security.md`.
6. `docs/spec/data-and-kpi.md`.
7. `docs/spec/integrations.md`.
8. `docs/spec/ai.md`.
9. `docs/security/LOCAL_SECURITY_AUDIT.md`.
10. `AGENTS.md`.

## Podsumowanie

- ZGODNE: 9.
- CZĘŚCIOWE: 13.
- BRAK: 6.
- SPRZECZNE: 0.

Najważniejsza zmiana względem starej macierzy: repozytorium nie jest już tylko
frontendem w Storybooku. Istnieje lokalny backend sandbox z API, workerem,
migracjami SQL, kontraktami, testami HTTP oraz security baseline. Nadal nie
jest to backend produkcyjny.

## Macierz

Obszar | Wymaganie | Stan aktualny | Status | Działanie
--- | --- | --- | --- | ---
Repozytorium | Modularne monorepo pnpm z Turborepo | Root zawiera `pnpm-workspace.yaml`, `turbo.json`, `apps/*` i `packages/*`. | ZGODNE | Zachować orkiestrację root i instalować zależności w pakietach właściwych dla zakresu.
Frontend | Zachować istniejący frontend i Storybook | `apps/web` działa z React, Vite, Storybook, Vitest i Playwright; Storybook używa komponentów z `src`. | ZGODNE | Nie usuwać Storybooka; rozwijać UI dopiero w osobnych promptach.
Backend API | Osobna aplikacja API | `apps/api` istnieje z lokalnym runtime, healthcheckiem i testami HTTP `/v1`. | CZĘŚCIOWE | Zastąpić runtime sandbox produkcyjnym frameworkiem dopiero po właściwym ADR i zadaniu.
BFF | Osobna warstwa BFF/API boundary | ADR BFF istnieje, ale `apps/bff` nie zostało utworzone. | BRAK | Utworzyć BFF w osobnym zakresie, bez mieszania z UI.
Worker | Osobny worker | `apps/worker` istnieje z lokalnym runtime, healthcheckiem i job manifestem. | CZĘŚCIOWE | Dodać produkcyjne repozytoria, scheduler i kolejkę w osobnym zadaniu.
Contracts | Wspólny kontrakt `/v1` | `packages/contracts` definiuje `contractVersion`, `/v1`, headers, idempotency, ETag, cursor pagination, endpointy auth/dashboard/reports. | ZGODNE | Utrzymywać jako publiczną granicę między pakietami.
Database | SQL bez ORM i role migracyjne/runtime | `packages/database` zawiera manifest tabel, migracje SQL i role `papadata_migrator`, `papadata_app`, `papadata_test`. | CZĘŚCIOWE | Dodać produkcyjne repozytoria `pg` i testy compatibility migracji.
Local runtime | Docker Compose local parity | Jest `postgres`, `redis`, `api`, `worker`, `migrate`. | CZĘŚCIOWE | Dodać web, bff, scheduler, seed, queue emulator, storage emulator i OTel.
Auth | Cookies, CSRF, refresh rotation, OTP, MFA, sessions, lockout, audit | Lokalny backend auth spełnia zakres Promptu 3 i ma testy HTTP. | CZĘŚCIOWE | Podłączyć trwałe repozytoria, provider e-mail i produkcyjny session store.
Tenant/workspace | Tenant, workspace, membership, role, policy, onboarding | Lokalny backend obsługuje encje, role, JIT support, onboarding i testy izolacji. | CZĘŚCIOWE | Dodać trwałe repozytoria i pełny policy engine.
Compliance | CMP, legal documents, audit, notifications | Lokalny backend obsługuje consent, legal acceptances i trwałe powiadomienia. | CZĘŚCIOWE | Podmienić treści prawne po legal review i dodać produkcyjne kanały.
Integracje | MVP providerzy i canonical pipeline | Sandboxy WooCommerce, Allegro, Google Ads, Meta Ads oraz tabele source/normalized/canonical istnieją. | CZĘŚCIOWE | Dodać Shopify, BaseLinker, GA4 i produkcyjne adaptery providerów.
Metric Engine | Definicje KPI i Dashboard API | 27 metryk, snapshoty, readiness i endpointy dashboardu działają lokalnie. | CZĘŚCIOWE | Dodać joby produkcyjne, cache i trwałe repozytoria.
Reports | Eksporty i pliki | Lokalny raport tworzy rzeczywisty plik, status i download. | CZĘŚCIOWE | Dodać produkcyjny storage i kontrolowane udostępnianie.
AI | Papa Asystent z evidence, refusal, approval i eval | Lokalny backend obsługuje AI threads/messages/evidence/refusal/approvals i `INSUFFICIENT_DATA`. | CZĘŚCIOWE | Dodać provider AI, governance gate i monitoring produkcyjny.
Billing | Pełny sandbox lifecycle | Lokalny billing sandbox obsługuje activation, plan change, cancel, resume, payment events, invoice, usage i entitlements. | CZĘŚCIOWE | Podłączyć wybranego operatora i self-service flows po ADR.
Security docs | Lokalny baseline bezpieczeństwa | Dodano audit, security headers draft, privacy docs, AI use register, notices i security scripts. | ZGODNE | Wymagany legal review i produkcyjne hardening gates.
CI | Automatyczne bramy jakości | `.github/workflows/ci.yml` uruchamia install, lint, typecheck, spell, markdownlint, test, build, Storybook, audit i walidację Docker Compose. | CZĘŚCIOWE | Dodać secret scan, SAST, SBOM i artefakty dowodowe w Prompt 9/hardening.
SAST/SBOM/container scan | Bramy hardeningu | Nie wdrożono. | BRAK | Dodać w Prompt 9/hardening.
Secret scan | Automatyczny skan sekretów | Wykonano lokalny `rg` audit, ale brak narzędzia CI. | BRAK | Dodać dedykowany secret scan i procedurę rotacji.
OpenAPI | Kontrakt HTTP publikowany jako OpenAPI | TypeScript contracts istnieją; OpenAPI nie jest generowane. | BRAK | Dodać OpenAPI po stabilizacji API frameworka.
Observability | OTel, structured logs, job observability | Lokalne audit/job records istnieją; OTel collector nie istnieje. | BRAK | Dodać OTel i runbooki operacyjne.
Backup/restore | Recovery evidence | Nie wdrożono ćwiczenia restore. | BRAK | Dodać test backup/restore przed go-live.

## Zielone kontrole po aktualnym zakresie

- `pnpm install --frozen-lockfile`.
- `pnpm markdownlint`.
- `pnpm spell`.
- `pnpm typecheck`.
- `pnpm lint`.
- `pnpm build`.
- `pnpm build-storybook`.
- `pnpm test:storybook`.
- `pnpm security:audit`.
- `pnpm security:check`.
- `pnpm test`.

## Najbliższe braki produkcyjne

1. Rozszerzenie CI o secret scan, SAST, SBOM i artefakty dowodowe.
2. BFF i pełny lokalny runtime parity: web, scheduler, seed, queue/storage
   emulator, OTel.
3. Trwałe repozytoria `pg` dla lokalnych runtime sandbox.
4. Produkcyjne providery auth, e-mail, storage, queue, billing i AI.
5. Legal review dokumentów privacy/legal i finalne treści legal documents.
6. Backup/restore, failure injection, recovery runbooki i rollback evidence.
