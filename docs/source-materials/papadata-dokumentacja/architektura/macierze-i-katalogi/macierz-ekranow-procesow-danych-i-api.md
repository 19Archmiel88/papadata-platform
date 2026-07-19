# Macierz ekranów procesów danych i API

PAPADATA

Macierz ekran - proces - dane - API

Techniczne odwzorowanie 15 obszarów UI/UX

Tabela:
- Wiersz 1: Kod dokumentu; A12
- Wiersz 2: Wersja; 1.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Powiązać każdy ekran i flow z danymi, akcjami, rolami, stanami, błędami i Storybookiem. [FAKT/ZAKRES]

Zakres: M01-M15; podstawa backlogu, kontraktów i testów akceptacyjnych. [FAKT/ZAKRES]

Poza zakresem: Finalny layout i mikrocopy. [OGRANICZENIE]

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

## Zasady macierzy

Pozycja MVP wymaga pełnej ścieżki danych, błędu, uprawnień i audytu.

Etap 2/Później może istnieć jako story/kontrakt bez runtime.

M02 jest systemem jakości, nie domeną biznesową.

Odczyty analityczne zwracają readiness; mutacje mają expectedVersion/idempotency i audyt.

## M01 Dostęp, rejestracja i onboarding

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Logowanie i MFA; session, methods, policy; login, verify MFA, reauth; wszyscy; invalid/locked/expired; default/loading/error/MFA/recovery; MVP
- Wiersz 3: Akceptacja zaproszenia; invitation, membership target, role; accept, request new invite; zaproszony; expired/email mismatch/revoked; valid/expired/wrong email/success; MVP
- Wiersz 4: Onboarding do pierwszej wartości; workspace profile, pilot gate, readiness; save profile, choose source, resume; Owner/Admin; blocked/partial/interrupted OAuth; steps/resume/blocked; MVP

## M02 System wspólny Storybooka

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Kontekst pełnego ekranu; role, workspace, period, readiness; switch fixtures, simulate command; zespół; contract mismatch; all global states; MVP narzędzie
- Wiersz 3: Biblioteka statusów i błędów; status/error catalogs; inspect variants; zespół; missing variant; light/dark/a11y; MVP narzędzie
- Wiersz 4: Flow harness; mock server, event timeline; run happy/error path; zespół; nondeterministic mock; full scenarios; MVP narzędzie

## M03 Powłoka produktu i nawigacja

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: App shell i kontekst; user, workspace, capabilities, notifications; switch workspace; wszyscy; forbidden context/expired; loading/no membership/suspended; MVP
- Wiersz 3: Centrum powiadomień; notifications, severity, owner, target; acknowledge/open; wg scope; target unavailable; empty/unread/error; MVP ograniczony
- Wiersz 4: Globalne blokady; system/status tenanta; retry/contact support; wszyscy; maintenance/policy block; degraded/blocked; MVP

## M04 Centrum Dowodzenia

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Podsumowanie operacyjne; KPI, readiness, issues, recommendations; filter/drill/assign; Owner/Admin/Analyst/Viewer; partial/stale/forbidden; ready/partial/no data/error; MVP
- Wiersz 3: Drill-down KPI; definition, evidence, dimensions; compare/open sources/create insight; Analyst+; definition changed/unsupported dimension; all readiness; MVP
- Wiersz 4: Kolejka priorytetów; issues/recommendations/owner; review/decide/assign; Owner/Admin/Analyst; expired/data changed/no owner; empty/overdue/blocked; MVP

## M05 Kampanie płatne

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Wyniki kampanii; ad metrics, attribution, spend, readiness; filter/compare/insight; Marketing/Analyst; provider delayed/attribution mismatch; partial/stale/ready; Etap 2 lub zależne
- Wiersz 3: Atrybucja vs sprzedaż; transactional vs attributed; inspect model/gap; Analyst; missing link; not comparable/partial; Etap 2
- Wiersz 4: Rekomendacje kampanii; insight, evidence, impact; accept/reject/task; Marketing/Owner; expired/policy blocked; needs review/rejected; Etap 2

## M06 Zamówienia

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Lista zamówień kanonicznych; orders, lineage, status; filter/inspect; Analyst/Viewer; duplicate/conflict/currency; ready/partial/conflict; MVP pion sprzedaży
- Wiersz 3: Szczegóły i lineage; canonical + source refs; open conflict/export; Analyst; source unavailable; lineage complete/incomplete; MVP
- Wiersz 4: Rekoncyliacja; source vs canonical totals; acknowledge/reprocess; Analyst/Ops; mismatch threshold; matched/unmatched; MVP ograniczony

## M07 Produkty

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Wyniki produktów; product/variant metrics, cost readiness; filter/compare; Analyst/Viewer; mapping/cost missing; partial/ready; Etap 2
- Wiersz 3: Mapowanie produktów/ofert; SKU, external IDs, confidence; confirm/split/merge request; Analyst/Admin; ambiguous match; exact/ambiguous/unmapped; Etap 2
- Wiersz 4: Rentowność produktu; revenue, cost, fees, margin; drill down; Owner/Analyst; missing cost/fees; unknown vs zero; Etap 2

## M08 Klienci

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Segmenty i kohorty; pseudonymized customer metrics; filter/compare; Analyst/Marketing scoped; privacy/low sample; masked/aggregated; Etap 2
- Wiersz 3: Retencja i LTV; orders/customer refs, definitions; inspect cohort; Analyst; identity partial; partial/ready; Później
- Wiersz 4: Eksport odbiorców; approved segment/destination; request export; Marketing capability; consent/policy; approval required; Później

## M09 Ruch i lejek

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Ruch na stronie; sessions/events/readiness; filter channel; Marketing/Analyst; tracking gap; partial/stale; Etap 2
- Wiersz 3: Lejek sprzedażowy; stage definitions/counts/conversion; compare periods; Analyst; definition changed; definition_changed; Etap 2
- Wiersz 4: Kanał -> sprzedaż; attribution + transaction evidence; inspect discrepancy; Analyst/Marketing; not comparable; limited evidence; Etap 2

## M10 Integracje i synchronizacja

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Katalog i dostępność; provider catalog/runtime; start connect; Owner/Admin; provider disabled; catalogued/not available; MVP
- Wiersz 3: Szczegóły connection; scope, credential, sync, readiness; reconnect/disable/sync; Owner/Admin; reauth/limited scope; all integration states; MVP
- Wiersz 4: Historia synchronizacji; jobs, checkpoints, errors; retry/reprocess; Admin/Analyst/Ops; DLQ/provider outage; queued/running/failed; MVP

## M11 Jakość danych i integralność

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Dashboard jakości; assessments, thresholds, impact; filter/open issue; Analyst/Admin; assessment unavailable; ready/partial/invalid; MVP
- Wiersz 3: Lista problemów; issues, severity, owner, KPI; assign/ack/resolve; Analyst/Admin/Ops; resolution conflict; open/in progress/resolved; MVP
- Wiersz 4: Konflikt/source authority; candidates, rule version, lineage; manual resolution; Data steward/Analyst; no deterministic choice; manual review; MVP ograniczony

## M12 Papa Asystent i Laboratorium AI

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Asystent kontekstowy KPI; question, snapshot, evidence; ask/refine/open evidence; Analyst/Owner/Viewer scoped; insufficient/provider; all AI states; MVP ograniczony
- Wiersz 3: Rekomendacja i decyzja; facts, inference, recommendation, impact; accept/reject/defer; Owner/Analyst; expired/data changed; needs review/rejected; MVP
- Wiersz 4: Laboratorium AI; bounded datasets, model config, budget; run/compare; special capability; policy/cost limit; sandboxed; Etap 2

## M13 Ustawienia, zespół i bezpieczeństwo

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Ustawienia workspace; profile, timezone, currency; update with impact; Owner/Admin; requires reprocess; dirty/saved/reprocess; MVP
- Wiersz 3: Zespół i role; memberships, roles, invitations; invite/change/suspend; Owner/Admin; last owner/self-lockout; all membership states; MVP
- Wiersz 4: Security i audit; MFA policy, sessions, audit; revoke/export audit; Owner/Security; reauth required; sensitive operation; MVP

## M14 Subskrypcja i płatności

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Plan i limity; subscription, entitlements, usage; change/request change; Owner/Billing; limit/past due; active/past due; MVP minimalny
- Wiersz 3: Zużycie; canonical units, jobs, AI cost; filter period; Owner/Billing; metering delayed; estimated/final; MVP minimalny
- Wiersz 4: Faktury i płatność; invoice refs, payment status; provider portal; Billing; provider unavailable; paid/failed; Etap 2

## M15 Wsparcie marketingu - decyzje i działania

Tabela:
- Wiersz 1: Ekran/flow; Dane/odczyt; Akcje/komendy; Role; Błędy/stany; Storybook; Etap
- Wiersz 2: Kolejka decyzji; recommendations, owner, evidence, expiry; decide/assign; Owner/Marketing/Analyst; expired/data changed; needs review; MVP decyzji
- Wiersz 3: Plan działania; approved decisions, tasks, dependencies; schedule/complete; Marketing/Owner; blocked dependency; planned/in progress; Etap 2
- Wiersz 4: Pomiar rezultatu; baseline, target, outcome metric; close/reopen; Analyst/Owner; insufficient follow-up; measured/inconclusive; MVP ograniczony

## Mapowanie na główne API

Tabela:
- Wiersz 1: Akcja; Odpowiedź; Cel; Błędy; Kontrakt
- Wiersz 2: GET /v1/session-context; SessionContext; boot aplikacji; 401/403/423; user, tenant, workspace, capabilities, entitlements
- Wiersz 3: POST /v1/invitations/{token}/accept; MembershipView; akceptacja zaproszenia; 409/410/422; idempotencyKey, audit
- Wiersz 4: GET /v1/workspaces/{id}/overview; CommandCenterView; Centrum Dowodzenia; 403/404/409/503; readiness, lastUpdated, evidence
- Wiersz 5: GET /v1/metrics/{code}; MetricView; KPI/drill-down; 404/409/422; definitionVersion, scope, readiness, limitations
- Wiersz 6: POST /v1/integration-connections; OperationAccepted; connect intent; 403/409/422/503; providerId, scopes, returnUrl, operationId
- Wiersz 7: POST /v1/integration-connections/{id}/reauthorize; OperationAccepted; reconnect; 403/409/422; expectedVersion, operationId
- Wiersz 8: POST /v1/integration-connections/{id}/sync-jobs; OperationAccepted; sync/backfill; 403/409/429; type, range, idempotencyKey
- Wiersz 9: GET /v1/operations/{id}; OperationStatus; status długiego procesu; 403/404; state, progress, resultRef, error, retryAt
- Wiersz 10: GET /v1/datasets/{id}/readiness; ReadinessView; jakość danych; 403/404/503; dimensions, affectedMetrics, nextActions
- Wiersz 11: GET /v1/data-issues; CursorPage<DataIssueView>; lista problemów; 403/422; filters, cursor, stable sort
- Wiersz 12: POST /v1/data-issues/{id}/resolve; DataIssueView; manual resolution; 403/409/422; resolutionType, rationale, expectedVersion
- Wiersz 13: POST /v1/assistant/analyses; Stream/AnalysisAccepted; analiza AI; 403/409/422/429/503; contextRef, question, budgetClass
- Wiersz 14: POST /v1/recommendations/{id}/decisions; DecisionView; decyzja człowieka; 403/409/410/422; result, rationale, evidenceHash
- Wiersz 15: POST /v1/actions/{id}/execute; OperationAccepted; kontrolowane działanie; 403/409/410/422; approvalId, idempotencyKey, reauthToken
- Wiersz 16: GET /v1/audit-events; CursorPage<AuditEventView>; audyt; 403/422; immutable records, restricted filters
- Wiersz 17: GET /v1/subscription/usage; UsageView; billing; 403/503; estimated/final, meterVersion

## Kryteria akceptacji ekranu

Ekran nie renderuje danych poprzedniego workspace po zmianie kontekstu.

Partial nie wygląda jak ready; loading nie ukrywa statusu procesu.

Błąd ma klasę, wpływ i nextAction.

Akcja niedozwolona jest blokowana przez API, nie tylko UI.

Fixture przechodzi walidację kontraktu.

Operacja krytyczna ma audit event i correlationId.

MVP screen ma happy path, dwa błędy domenowe i forbidden.

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.
