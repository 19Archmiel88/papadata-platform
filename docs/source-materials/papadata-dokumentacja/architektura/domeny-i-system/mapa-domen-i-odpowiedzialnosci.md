# Mapa domen i odpowiedzialności

PAPADATA

Mapa domen i odpowiedzialności

Bounded contexts, własność logiki i zależności

Tabela:
- Wiersz 1: Kod dokumentu; A02
- Wiersz 2: Wersja; 1.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Ustanowić granice odpowiedzialności, aby logika nie była rozproszona między UI, joby i integracje. [FAKT/ZAKRES]

Zakres: Domeny, ownerzy reguł/danych, zależności, zdarzenia i zakazane sprzężenia. [FAKT/ZAKRES]

Poza zakresem: Fizyczny podział na mikroserwisy i struktura organizacyjna zespołów. [OGRANICZENIE]

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

## Zasady granic

Granica wynika z własności reguł i danych, nie z ekranu.

Domena publikuje kontrakt; inne domeny nie zapisują bezpośrednio jej tabel.

Adapter nie definiuje modelu biznesowego PapaData.

Frontend korzysta z projekcji i nie jest ownerem procesu.

Zdarzenia nie zastępują transakcji wewnątrz modułu.

Tabela:
- Wiersz 1: Kod; Domena; Cel; Procesy; Dane; Zależności; Ryzyko; Priorytet
- Wiersz 2: D-01; Identity & Access; Uwierzytelnienie i sesja; logowanie, MFA, recovery, reauth; Identity, Session, MFAChallenge; D-02, D-12; przejęcie konta; MVP
- Wiersz 3: D-02; Tenant i Workspace; Kontekst tenantu i członkostwa; workspace, membership, invitation; Tenant, Workspace, Membership; D-01, D-03, D-13; wyciek cross-tenant; MVP
- Wiersz 4: D-03; Authorization & Entitlements; Decyzje dostępu i planu; RBAC/ABAC, capability, data scope; Role, Capability, Policy, Entitlement; D-01, D-02, D-13; logika uprawnień w UI; MVP
- Wiersz 5: D-04; Integration Management; Cykl życia connection; connect, reconnect, scopes, statusy; Provider, Connection, Scope; D-02, D-05, D-12; sekrety i scope; MVP
- Wiersz 6: D-05; Ingestion & Synchronization; Pobranie danych; initial sync, incremental, backfill, webhook; SyncJob, Checkpoint, SourceBatch; D-04, D-06, D-12; duplikaty i retry storm; MVP
- Wiersz 7: D-06; Data Quality & Readiness; Ocena jakości i gotowości; walidacja, issue, readiness, resync; Dataset, Assessment, DataIssue; D-05, D-07, D-08; fałszywe READY; MVP
- Wiersz 8: D-07; Canonical Commerce Data; Jednoznaczny fakt biznesowy; normalizacja, source authority, dedupe; CanonicalOrder, Product, CustomerRef; D-05, D-06, D-08; podwójne liczenie; MVP
- Wiersz 9: D-08; Metrics & Analytics; Wersjonowane KPI; calculation, snapshot, compare; MetricDefinition, MetricSnapshot; D-06, D-07, D-09; różne definicje KPI; MVP
- Wiersz 10: D-09; Insights & Decisions; Od obserwacji do decyzji; insight, recommendation, decision, outcome; Insight, Recommendation, Decision; D-08, D-10, D-11; rekomendacja bez ownera; MVP
- Wiersz 11: D-10; AI Assistant; Kontrolowana interpretacja; retrieval, answer, evidence, review; Thread, Message, Evidence, ModelRun; D-03, D-06, D-08, D-09; prompt injection i leakage; MVP ograniczony
- Wiersz 12: D-11; Actions & Automation; Bezpieczne wykonanie działań; approval, execution, rollback; ActionProposal, Approval, Execution; D-03, D-09, D-10; excessive agency; Etap 2
- Wiersz 13: D-12; Audit, Notifications & Operations; Dowody i obsługa operacyjna; audit, alert, support, incident; AuditEvent, Notification, Incident; wszystkie domeny; brak dowodu i alert fatigue; MVP
- Wiersz 14: D-13; Subskrypcja i billing; Plan, limity i usage; subscription, metering, invoice ref; Subscription, UsageRecord; D-02, D-03, D-12; błędny metering; MVP minimalny
- Wiersz 15: D-14; Configuration & Governance; Wersjonowane reguły i bramy; feature flag, rule version, evidence, ADR; RuleVersion, GateEvidence, ADR; wszystkie domeny; zmiana bez reprocessingu; MVP

## Własność reguł krytycznych

Tabela:
- Wiersz 1: Reguła; Właściciel; Konsumenci; Zakazane uproszczenie
- Wiersz 2: Czy user może wykonać akcję; Authorization; API, UI, Jobs, AI; sprawdzenie tylko w UI
- Wiersz 3: Czy connection jest ważny; Integration Management; Ingestion, UI; ACTIVE na podstawie tokenu
- Wiersz 4: Czy rekord to jeden fakt; Canonical Data; Metrics, AI; dedupe w raporcie
- Wiersz 5: Czy dataset/KPI jest gotowy; Readiness; Metrics, UI, AI; gotowość z liczby rekordów
- Wiersz 6: Jak liczyć KPI; Metrics; UI, AI, Billing; formuła w komponencie/prompt
- Wiersz 7: Czy action może być wykonany; Actions + Authorization; AI, UI, Workers; model AI jako policy engine
- Wiersz 8: Jak długo przechowywać dane; Governance/Security; Data, AI, Integrations; implicit retention
- Wiersz 9: Jak mierzyć usage; Billing + domena; Entitlements, UI; liczenie retry jako wartości

## Reguły komunikacji

Komenda trafia do jednego ownera procesu.

Zdarzenia publikowane są przez transactional outbox.

Odczyty przekrojowe korzystają z projekcji.

CorrelationId, causationId i tenant/workspace przechodzą przez proces.

Event payload jest minimalny i nie zawiera sekretów.

Schematy API/event są wersjonowane kompatybilnie.

## Luki architektoniczne

Tabela:
- Wiersz 1: Luka; Wpływ; Rekomendacja; Owner
- Wiersz 2: Brak zatwierdzonego Tenant/Workspace; cross-tenant i billing; DEC-ARCH-001 przed DB; Product + Security
- Wiersz 3: Brak provider pilotażowego; brak vertical slice; wybór na danych klienta; Product + Integrations
- Wiersz 4: Brak pełnych formuł KPI; brak weryfikacji wartości; MetricDefinition v1 + test vectors; Data Owner
- Wiersz 5: Brak RTO/RPO; brak go-live; decyzja i restore exercise; Security/Ops
- Wiersz 6: Brak data classes/retention; privacy i koszt; klasyfikacja per encja/provider; Privacy + Data

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.
