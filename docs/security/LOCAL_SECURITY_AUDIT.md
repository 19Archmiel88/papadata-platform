# Local Security Audit

Status: baseline lokalny po audycie technicznym.
Data: 2026-07-20.
Commit bazowy audytu: `4073843`.
Zakres: repozytorium lokalne PapaData, szczególnie frontend React/Vite,
Storybook, pnpm, konfiguracja środowiskowa i dokumentacja zgodności.

Ten dokument ma dwie części: stan początkowy ustalony z komend audytowych przed
remediacją oraz stan po zmianach wykonanych w tym zadaniu.

## Executive Summary

Nie znaleziono jawnego produkcyjnego sekretu w źródłach aplikacji webowej.
Znaleziono natomiast lokalne wartości podobne do haseł w `.env.example`,
fallbackach Docker/PostgreSQL oraz wiele syntetycznych haseł i tokenów w
fixture'ach i testach auth. Wartości środowiskowe zostały zastąpione jawnym
placeholderem lokalnym, a testowe fixture'y pozostają jako dane syntetyczne.

Aplikacja webowa nie używa `react-markdown`, `dangerouslySetInnerHTML`,
runtime MSW ani browser storage dla danych użytkownika. Istniejący runtime AI
sanityzuje treści Markdown i blokuje próby ujawniania sekretów; testy zostały
rozszerzone o HTML, `javascript:` i bezpieczne linki. Istniejący runtime
workspace odrzuca późne odpowiedzi po zmianie workspace i ma testy izolacji.

Dodano minimalny baseline dokumentów bezpieczeństwa, prywatności, prawnych,
AI governance i zależności. Gotowość produkcyjna nadal wymaga backendu,
hostingu z nagłówkami bezpieczeństwa, CI/SCA/SAST/secrets scan, testów
integracyjnych i przeglądu prawnego.

## Tech Stack

- Monorepo pnpm workspaces: `apps/*`, `packages/*`.
- Frontend: React 19, TypeScript strict, Vite 8, Tailwind CSS 4, Storybook 10.
- Testy web: Vitest, Storybook Vitest addon, Playwright, axe-core.
- Backend lokalny w repo: `apps/api`, `apps/worker`, SQL migrations bez ORM.
- Pakiety współdzielone: `contracts`, `database`, `testing`.
- Runtime lokalny: Docker Compose z PostgreSQL, Redis, API, worker i migracjami.

## Project Structure

```text
apps/
  api/
  web/
  worker/
packages/
  contracts/
  database/
  testing/
docs/
  adr/
  architecture/
  legal/
  privacy/
  security/
  spec/
infra/
  docker/
  postgres/
```

Repo nie jest nowym pojedynczym projektem frontendowym; jest już monorepo.
Nie zmieniano tej architektury i nie usuwano Storybooka ani frontendu.

## Initial Findings

Severity: Medium
Location: `.env.example`, `compose.yaml`,
`infra/postgres/init/00-create-local-roles.sh`,
`packages/database/scripts/migrate.sh`
Impact: lokalne fallbacki wyglądały jak hasła i mogły zostać skopiowane do
środowiska współdzielonego.
Recommended fix: używać jednoznacznych placeholderów lokalnych i opisać, że
`VITE_*` jest publiczne po buildzie.
Status: fixed.

Severity: Medium
Location: `.gitignore`
Impact: brak jawnych wzorców dla części plików sekretów i raportów
bezpieczeństwa.
Recommended fix: dodać `.env.local`, `.env.*.local`, `*.p12`, `*.pfx` i
`reports/security/`, bez ignorowania `.env.example`.
Status: fixed.

Severity: Medium
Location: root `package.json`
Impact: brak jednolitej komendy dla audytu produkcyjnych zależności i
podstawowego security check.
Recommended fix: dodać `security:audit` i `security:check`.
Status: fixed.

Severity: Medium
Location: `apps/web/vite.config.ts`
Impact: brak jawnego guardu builda przed włączeniem mock runtime w produkcji i
brak jawnej polityki sourcemap.
Recommended fix: blokować produkcyjny build z flagami mocków i ustawić
`build.sourcemap=false`.
Status: fixed.

Severity: Medium
Location: `docs/security`, root repo, `docs/privacy`, `docs/legal`
Impact: brak repozytoryjnego baseline dla zgłaszania luk, notice zależności,
retencji, DSAR, incydentów i AI use.
Recommended fix: dodać roboczą dokumentację z miejscami do przeglądu
prawnego i właścicielskiego.
Status: fixed as draft; legal review required.

Severity: Low
Location: `apps/web/src/features/ai/localAiRuntime.ts`
Impact: istniejąca sanitacja blokowała skrypty i sekrety, ale testy nie
pokrywały osobno tagu obrazka z handlerem, normalnego Markdown ani
bezpiecznego linku.
Recommended fix: rozszerzyć testy i usuwać HTML z wejścia użytkownika.
Status: fixed.

Severity: Low
Location: `apps/web/src/shell/sessionContext.security.test.ts`
Impact: mechanizm scope istnieje; audyt musiał potwierdzić, że późna odpowiedź
po zmianie workspace jest ignorowana.
Recommended fix: utrzymać test `late_response`, nie wprowadzać React Query bez
scoped query keys.
Status: already covered; documented.

Severity: Low
Location: `apps/web/src`, `apps/web/.storybook`
Impact: nie znaleziono runtime MSW ani publicznego `mockServiceWorker.js`; brak
ryzyka produkcyjnego MSW w aktualnej aplikacji, ale przyszłe włączenie powinno
mieć guard.
Recommended fix: utrzymać MSW wyłącznie dla dev/test/Storybook i używać
dynamic import z `import.meta.env.DEV`, jeśli zostanie dodany.
Status: not applicable now; build guard added.

Severity: Low
Location: `apps/web/src`
Impact: nie znaleziono `localStorage`, `sessionStorage`, IndexedDB, Cache API
ani utrwalania Zustand dla danych użytkownika.
Recommended fix: dopuszczać wyłącznie preferencje niesensytywne w storage.
Status: no issue found; policy documented.

## Secret Scan Summary

Komenda skanowała hasła, tokeny, sekrety, klucze API i podobne wzorce bez
drukowania wartości w raporcie końcowym.

- `.env.example`: lokalne placeholdery haseł; zastąpione
  `change-me-local-only`.
- `compose.yaml`: lokalne fallbacki haseł PostgreSQL; zastąpione
  `change-me-local-only`.
- `infra/postgres/init/00-create-local-roles.sh`: lokalne fallbacki haseł ról;
  zastąpione `change-me-local-only`.
- `packages/database/scripts/migrate.sh`: lokalny fallback migratora;
  zastąpiony `change-me-local-only`.
- `apps/web/src/fixtures`, `apps/web/src/auth`, `apps/web/e2e`,
  `apps/api/*.test.mjs`: syntetyczne hasła, kody i tokeny testowe; pozostają
  jako fixture'y testowe.
- `docs/source-materials/**`: dokumentacja wymagań opisuje tokeny i sekrety;
  brak dowodu na realny sekret.

Jeżeli którykolwiek placeholder lokalny był wcześniej użyty poza lokalnym
środowiskiem developerskim, wymagana jest rotacja tych danych.

## Rendering And XSS

Nie znaleziono `react-markdown`, `rehype-raw` ani `dangerouslySetInnerHTML` w
aplikacji webowej. Treści AI są traktowane jako tekst/Markdown domenowy,
sanityzowane przez `sanitizeMarkdownContent` i nie powinny być renderowane jako
surowy HTML. Dodano testy dla:

- `<script>`;
- obrazka z handlerem zdarzenia;
- linku `javascript:`;
- normalnego Markdown;
- bezpiecznego linku zewnętrznego.

## MSW And Storybook

Nie znaleziono `setupWorker`, `mockServiceWorker.js` ani runtime MSW w
`apps/web/src`. Storybook pozostaje nietknięty. Dodany guard Vite blokuje
produkcyjny build, jeżeli ktoś ustawi `VITE_ENABLE_MSW=true`,
`VITE_ENABLE_MOCKS=true` albo `VITE_MSW_ENABLED=true`.

## Tenant And Workspace

Repo nie używa React Query. Istniejący `createWorkspaceRuntime` generuje token
requestu z `tenantId`, `workspaceId` i `generation`. Po zmianie workspace
zwiększa generację, czyści cache/drafty/streamy i odrzuca odpowiedzi starego
workspace jako `late_response`. Pokrycie testowe jest w
`apps/web/src/shell/sessionContext.security.test.ts`.

## Browser Storage

Nie znaleziono użycia `localStorage`, `sessionStorage`, IndexedDB, Cache API
ani cookies w produkcyjnym kodzie webowym. Cookies występują w lokalnym
serwerze auth/testach. Polityka: browser storage może przechowywać tylko
niesensytywne preferencje, nigdy provider tokenów, haseł, OTP, recovery codes,
refresh tokenów ani danych tenant/workspace bez ponownej walidacji backendu.

## Changed Files

- `.gitignore`
- `.env.example`
- `.cspell/papadata-words.txt`
- `package.json`
- `apps/web/vite.config.ts`
- `apps/web/src/features/ai/localAiRuntime.ts`
- `apps/web/src/features/ai/aiIsolation.security.test.ts`
- `compose.yaml`
- `infra/postgres/init/00-create-local-roles.sh`
- `packages/database/scripts/migrate.sh`
- `SECURITY.md`
- `COPYRIGHT.md`
- `THIRD_PARTY_NOTICES.md`
- `docs/security/LOCAL_SECURITY_AUDIT.md`
- `docs/security/SECURITY_HEADERS.md`
- `docs/security/TENANT_WORKSPACE_FRONTEND_CONTRACT.md`
- `docs/privacy/DATA_INVENTORY.md`
- `docs/privacy/PROCESSING_REGISTER.md`
- `docs/privacy/RETENTION_MATRIX.md`
- `docs/privacy/SUBPROCESSORS.md`
- `docs/privacy/INCIDENT_AND_BREACH_PROCEDURE.md`
- `docs/privacy/DSAR_PROCEDURE.md`
- `docs/legal/AI_USE_REGISTER.md`

## Dependency Audit

Wyniki po remediacji:

- `pnpm install --frozen-lockfile`: passed, lockfile up to date.
- `pnpm list --depth 1`: passed.
- `pnpm -r list --depth 1`: passed, potwierdził zależności workspace.
- `pnpm outdated`: informational exit code `1`; nowszy major
  `typescript` `7.0.2` dostępny względem `6.0.3`.
- `pnpm security:audit`: passed, no known production vulnerabilities.

## Verification Results

- `pnpm markdownlint`: passed, 124 Markdown files, 0 issues.
- `pnpm spell`: passed, 332 files, 0 issues.
- `pnpm --filter @papadata/web typecheck`: passed.
- `pnpm --filter @papadata/web lint`: passed.
- `pnpm --filter @papadata/web test:auth`: passed, 28 files,
  125 tests.
- `pnpm typecheck`: passed, 6 packages.
- `pnpm lint`: passed.
- `pnpm build`: passed, 6 packages; web production bundle built by Vite.
- `pnpm build-storybook`: passed, Storybook static build completed.
- `pnpm test:storybook`: passed, 54 files, 353 tests in Chromium.
- `pnpm security:check`: passed, audit + build + Storybook build.
- `pnpm test`: passed, 8 Turbo tasks; API 40 tests, web Vitest
  125 tests, Playwright auth 4 tests, Storybook 353 tests.

Accessibility note: Storybook has `@storybook/addon-a11y` installed and tests
run in Chromium, but current Storybook preview config marks a11y checks as
`todo`; production gate should make a11y failures blocking.

## Open Risks

- Brak skonfigurowanego CI z dependency scan, secret scan, SAST, testami
  Storybook/a11y i publikacją raportów.
- Brak produkcyjnego hostingu z finalnym CSP, HSTS i polityką sourcemap.
- Dokumenty prywatności i prawne są draftem i wymagają przeglądu prawnego.
- Backend i runtime lokalny są w trakcie rozwoju; pełne bezpieczeństwo wymaga
  kontraktów, auth, autoryzacji i testów integracyjnych po stronie API.
- Brak automatycznego SBOM i kompletnej weryfikacji licencji transitive
  dependencies.

## Next Actions

1. Dodać CI dla `security:audit`, lint, typecheck, testów web i Storybook.
2. Dodać secrets scan, SAST, SBOM i container scan.
3. Ustalić finalne nagłówki hostingu i przetestować CSP w trybie report-only.
4. Przeprowadzić prawny review dokumentów privacy/legal.
5. Ustalić ownerów danych, retencji, subprocessors i DSAR.
