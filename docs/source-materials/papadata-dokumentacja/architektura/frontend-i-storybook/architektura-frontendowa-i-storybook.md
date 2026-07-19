# Architektura frontendowa i Storybook

PAPADATA

Architektura frontendowa i Storybook

Struktura aplikacji, kontrakty widoków, fixtures i testowanie

Tabela:
- Wiersz 1: Kod dokumentu; A04
- Wiersz 2: Wersja; 1.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Zapewnić frontend prezentujący wiarygodność danych bez przejmowania logiki domenowej. [FAKT/ZAKRES]

Zakres: Powłoka, routing, feature modules, server/local state, API client, Storybook, mocki i testy. [FAKT/ZAKRES]

Poza zakresem: Finalny design wizualny i wybór wszystkich bibliotek. [OGRANICZENIE]

Zasada interpretacji: Dokument opisuje stan docelowy i rekomendowany plan. Nie potwierdza istnienia kodu, infrastruktury, kontroli ani gotowości produkcyjnej. [FAKT]

## Podstawa źródłowa

Tabela:
- Wiersz 1: Kod; Dokument; Rola w architekturze
- Wiersz 2: D1; Dokumentacja produktu; Nadrzędna dokumentacja biznesowo-produktowa.
- Wiersz 3: D2; Rejestr decyzji i wymagań biznesowych; Jedyne źródło prawdy dla statusu i wersji decyzji.
- Wiersz 4: D3; Kontrakt danych, stanów i KPI; Źródło prawdy dla warstw danych, canonicalization, deduplikacji i readiness.
- Wiersz 5: D4; Integracje i gotowość operacyjna; Źródło prawdy dla providerów, bram, synchronizacji, retry i recovery.
- Wiersz 6: D5; Pierwszy pion produktowy i płatny pilotaż; Proces pierwszej mierzalnej wartości i kryteria pilotażu.
- Wiersz 7: D6; Model komercyjny i unit economics; Plany, limity, koszty, marża i bramy skalowania.
- Wiersz 8: D7; Bezpieczeństwo, Prywatność i AI Governance; Kontrole bezpieczeństwa, prywatności, ciągłości i AI.
- Wiersz 9: M01-M15; Specyfikacje architektury UI/UX; Ekrany, flow, stany, formularze, Storybook i priorytety.

Hierarchia: D2 ustala status decyzji; D3 semantykę danych/KPI; D4 gotowość integracji; D7 bezpieczeństwo i AI. M01-M15 opisują wymagania UI, ale nie dowodzą implementacji. [FAKT]

## Struktura aplikacji

src/
app/ # bootstrap, providers, routing, error boundaries
shell/ # navigation, workspace context, notifications
features/ # access, command-center, orders, campaigns, integrations, quality, AI...
domain-contracts/ # własne DTO/status/error; bez typów vendorów
shared/ui/ # design system
shared/patterns/ # ReadinessBanner, OperationTracker, EvidencePanel, DecisionCard
shared/api/ # client, auth, retry policy
shared/test/ # fixtures, handlers, builders
stories/ # pełne ekrany i flow

## Odpowiedzialność frontendu

Tabela:
- Wiersz 1: Frontend może; Frontend nie może
- Wiersz 2: Walidować format i wspierać usera; Podejmować finalnej decyzji auth
- Wiersz 3: Prezentować readiness i wpływ; Wyliczać readiness z lokalnych flag
- Wiersz 4: Przechowywać draft UI; Wyliczać KPI i deduplikować
- Wiersz 5: Śledzić operationId; Wznawiać job przez przypadkowy repeat
- Wiersz 6: Ukrywać akcję dla UX; Traktować ukrycie jako security
- Wiersz 7: Renderować AI stream; Przekazywać modelowi dane poza evidence pack

## Stan aplikacji

Tabela:
- Wiersz 1: Kategoria; Miejsce; Przykład; Zasada
- Wiersz 2: Server state; query cache; metrics/connections/issues; key zawiera workspace/scope/version
- Wiersz 3: Local UI; component/feature; panel/draft; nie jest state procesu
- Wiersz 4: Session/context; central provider; user/workspace/capabilities; switch czyści zależny state
- Wiersz 5: Process; server operation; sync/reprocess/AI; UI obserwuje operationId
- Wiersz 6: Sensitive; nie utrwalać; secret/MFA/token; write-only; brak analytics

## Wzorce UI

Tabela:
- Wiersz 1: Wzorzec; Cel; Dane; Stany
- Wiersz 2: WorkspaceContextBar; jawny zakres; org/workspace/timezone/currency/period; loading/forbidden/switching
- Wiersz 3: ReadinessBanner; gotowość/ograniczenia; status/scope/impact/nextActions; no_data/partial/delayed/invalid/ready
- Wiersz 4: OperationTracker; długi proces; operationId/progress/retry/error; queued/running/retry/failed/success
- Wiersz 5: EvidencePanel; dowody KPI/AI; source refs/versions/timestamps; available/restricted/stale
- Wiersz 6: DecisionCard; rekomendacja vs decyzja; facts/inference/impact/expiry; review/accepted/rejected/expired
- Wiersz 7: PermissionBoundary; spójny brak dostępu; capability/owner/request path; hidden/disabled/explained
- Wiersz 8: DataIssuePanel; problem jakości; class/severity/KPI/owner/action; open/progress/resolved

## Storybook - kontrakt

Story name zawiera moduł, ekran, rolę i stan.

Decorator ustawia org/workspace, capabilities, plan, timezone, currency i flags.

Mock handler zwraca DTO zgodne ze schema i realistyczne opóźnienie.

Interaction test przechodzi akcje i sprawdza komunikat wpływu.

A11y test obejmuje keyboard, focus, contrast, live regions i błędy.

Visual regression obejmuje light/dark i breakpoints.

Flow story przechodzi 202 -> running -> partial/success/error.

## Fixtures minimalne

Tabela:
- Wiersz 1: Fixture; Zakres
- Wiersz 2: ctx_owner_ready; Owner, pełne capability, READY
- Wiersz 3: ctx_admin_partial; Admin, connection active, PARTIAL
- Wiersz 4: ctx_analyst_invalid; Analyst, INVALID i affected KPI
- Wiersz 5: ctx_viewer_forbidden; Viewer bez command capability
- Wiersz 6: ctx_ops_jit; Ops JIT bez payload content
- Wiersz 7: integration_reauth; REAUTH_REQUIRED + history
- Wiersz 8: sync_retry_wait; RETRY_WAIT + retryAt
- Wiersz 9: quality_conflict; source overlap/manual review
- Wiersz 10: metric_definition_changed; old snapshot/new formula
- Wiersz 11: ai_insufficient_data; brak evidence
- Wiersz 12: ai_needs_review; recommendation impact/expiry
- Wiersz 13: billing_past_due; policy-limited entitlement

## Testy frontendu

Tabela:
- Wiersz 1: Poziom; Cel; Przykład; Brama
- Wiersz 2: Unit; format/logika prezentacji; status/date/currency; PR
- Wiersz 3: Component; interakcje patternów; Readiness/Decision; PR
- Wiersz 4: Contract; zgodność DTO/fixture; schema/error envelope; PR
- Wiersz 5: Flow/Storybook; scenariusz ekranu; connect/sync/decision; PR
- Wiersz 6: E2E; integracja z API; invite->KPI; release
- Wiersz 7: A11y/visual; dostępność/regresja; keyboard/responsive; PR/nightly

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.
