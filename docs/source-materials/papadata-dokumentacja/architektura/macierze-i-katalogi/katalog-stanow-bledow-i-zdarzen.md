# Katalog stanów błędów i zdarzeń

PAPADATA

Katalog stanów, błędów i zdarzeń

Wspólny kontrakt procesów frontend-backend

Tabela:
- Wiersz 1: Kod dokumentu; A13
- Wiersz 2: Wersja; 1.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Zapobiec lokalnym, sprzecznym statusom i komunikatom. [FAKT/ZAKRES]

Zakres: Stany integracji, datasetów, KPI, jobów, AI, membership; błędy API; eventy domenowe. [FAKT/ZAKRES]

Poza zakresem: Finalny katalog kodów każdego providera. [OGRANICZENIE]

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

## Stany integracji

Tabela:
- Wiersz 1: Kod; Znaczenie; UI; Dowód
- Wiersz 2: NOT_CONNECTED; Brak aktywnego connection; Pokaż wymagania i akcję Połącz; brak
- Wiersz 3: CONNECTING; Trwa OAuth/token exchange lub walidacja scope; Nie sugerować gotowości danych; operationId
- Wiersz 4: ACTIVE; Credential ważny i połączenie zweryfikowane; Osobno sync i readiness; connection verified
- Wiersz 5: SYNCING; Trwa initial/incremental sync; Postęp, zakres, checkpoint; job running
- Wiersz 6: LIMITED_ACCESS; Scope lub dane są ograniczone; Wpływ i brakujące uprawnienia; scope diff
- Wiersz 7: REAUTH_REQUIRED; Credential wygasł/cofnięty; Reconnect; oznacz dane historyczne; auth error
- Wiersz 8: ERROR; Błąd providera, schematu lub konfiguracji; Klasa błędu i next action; failed job
- Wiersz 9: DISABLED; Connection wyłączony przez użytkownika/politykę; Brak nowych danych; status historii; manual/policy

## Stany datasetu

Tabela:
- Wiersz 1: Kod; Znaczenie; UI
- Wiersz 2: NO_DATA; Nie pobrano użytecznych rekordów; Nie pokazuj 0; wskaż źródło i krok
- Wiersz 3: INGESTING; Trwa pobieranie; Postęp; KPI niedostępne
- Wiersz 4: PARTIAL; Część zakresu użyteczna; Wpływ i lista KPI dozwolonych/zablokowanych
- Wiersz 5: DELAYED; Dane przekraczają próg świeżości; Ostatni poprawny punkt i wpływ
- Wiersz 6: INVALID; Naruszenie schematu/integralności; Blokada zależnych KPI i issue
- Wiersz 7: PROCESSING; Normalizacja/canonicalization/reprocessing; Wersja reguły i operationId
- Wiersz 8: READY; Spełnione warunki lokalnej gotowości; Zakres, okres, waluta, wersje
- Wiersz 9: RESYNC_REQUIRED; Wymagana ponowna synchronizacja; Powód, wpływ, owner i akcja
- Wiersz 10: BLOCKED; Blokada polityki/bezpieczeństwa/konfliktu; Brak obejścia w UI

## Stany KPI

Tabela:
- Wiersz 1: Kod; Znaczenie; UI
- Wiersz 2: UNAVAILABLE; Brak datasetu/definicji; pokaż zależność
- Wiersz 3: CALCULATING; Trwa obliczenie; operation/progress
- Wiersz 4: PARTIAL; Wynik dla ograniczonego zakresu; wpływ i zakres
- Wiersz 5: READY; Spełniona lokalna readiness; value + version + evidence
- Wiersz 6: STALE; Przekroczona świeżość; last update + impact
- Wiersz 7: INVALIDATED; Rule change unieważnił snapshot; reprocess required
- Wiersz 8: BLOCKED; Policy/conflict/security; bez obejścia

## Stany jobów

Tabela:
- Wiersz 1: Kod; Znaczenie; Retry/akcja
- Wiersz 2: QUEUED; oczekuje; cancel jeśli bezpieczne
- Wiersz 3: RUNNING; przetwarza; progress/checkpoint
- Wiersz 4: RETRY_WAIT; oczekuje do retryAt; auto w budget
- Wiersz 5: SUCCEEDED; zakończony; resultRef
- Wiersz 6: PARTIAL_SUCCESS; część użyteczna; issue dla reszty
- Wiersz 7: FAILED; błąd końcowy; retry/support wg klasy
- Wiersz 8: CANCELLED; bezpiecznie anulowany; jawny skutek
- Wiersz 9: DEAD_LETTER; wyczerpany retry/invariant; manual replay + audit

## Stany AI

Tabela:
- Wiersz 1: Kod; Znaczenie; UI
- Wiersz 2: DISABLED; AI wyłączone dla workspace/planu/use case; Wyjaśnij warunek włączenia
- Wiersz 3: INSUFFICIENT_DATA; Brak danych spełniających kontrakt; Nie generuj pewnej odpowiedzi
- Wiersz 4: GENERATING; Trwa retrieval i generowanie; Streaming z anulowaniem
- Wiersz 5: ANSWERED; Odpowiedź powiązana z dowodami; Rozdziel fakty/wnioski/rekomendacje
- Wiersz 6: NEEDS_REVIEW; Rekomendacja/działanie wymaga człowieka; Owner, wpływ, odwracalność, termin
- Wiersz 7: REJECTED; Człowiek odrzucił rekomendację; Zachowaj rationale i audyt
- Wiersz 8: EXPIRED; Zmieniły się dane lub minął termin; Wymuś ponowną analizę
- Wiersz 9: PROVIDER_ERROR; Błąd modelu/gateway; Bezpieczny retry bez utraty kontekstu
- Wiersz 10: BLOCKED_BY_POLICY; Use case, dane lub akcja niedozwolone; Brak obejścia przez prompt

## Stany membership

Tabela:
- Wiersz 1: Kod; Znaczenie; Skutek
- Wiersz 2: INVITED; zaproszenie aktywne; brak dostępu do akceptacji
- Wiersz 3: ACTIVE; membership obowiązuje; access wg capabilities
- Wiersz 4: SUSPENDED; czasowo zablokowane; sessions revalidated/revoked
- Wiersz 5: DEACTIVATED; zakończone; brak dostępu, audit retained
- Wiersz 6: EXPIRED; czasowe membership wygasło; brak dostępu

## Błędy API

Tabela:
- Wiersz 1: Kod; HTTP; Znaczenie; UI
- Wiersz 2: AUTHENTICATION_REQUIRED; 401; Brak/wygaśnięcie sesji; Bezpieczne logowanie z returnTo
- Wiersz 3: REAUTHENTICATION_REQUIRED; 401; Operacja wymaga świeżej sesji/MFA; Modal reauth; nie powtarzać komendy automatycznie
- Wiersz 4: PERMISSION_DENIED; 403; Brak capability lub data scope; Ukrycie akcji nie wystarcza
- Wiersz 5: TENANT_SCOPE_VIOLATION; 403; Żądanie poza tenant/workspace; Ogólny komunikat, alert i audyt
- Wiersz 6: RESOURCE_NOT_FOUND; 404; Brak lub niedostępny zasób; Nie ujawniać cross-tenant
- Wiersz 7: STATE_CONFLICT; 409; Zasób zmienił wersję/status; Odśwież i ponów świadomie
- Wiersz 8: DATA_NOT_READY; 409; Dataset/KPI nie spełnia gotowości; Pokaż readiness i next actions
- Wiersz 9: RECOMMENDATION_EXPIRED; 410; Dane/evidence nieaktualne; Ponowna analiza
- Wiersz 10: VALIDATION_FAILED; 422; Błędne pola lub zakres; Błędy per pole i wpływ
- Wiersz 11: POLICY_BLOCKED; 422; Polityka zabrania use case/akcji; Brak obejścia; owner polityki
- Wiersz 12: RATE_LIMITED; 429; Limit użytkownika/tenantu/providera; retryAfter; bez agresywnego retry
- Wiersz 13: PROVIDER_UNAVAILABLE; 503; Awaria zależności; Lokalna degradacja
- Wiersz 14: PROCESSING_FAILED; 500; Błąd kontrolowanego procesu; correlationId i ścieżka wsparcia
- Wiersz 15: AI_PROVIDER_ERROR; 503; Błąd modelu/gateway; Nie prezentować częściowej odpowiedzi jako kompletnej

## Zdarzenia domenowe i operacyjne

Tabela:
- Wiersz 1: Event; Owner; Minimalny payload; Konsumenci
- Wiersz 2: identity.session.created; Identity; userId, workspaceId, authStrength; audit/security
- Wiersz 3: membership.invited; Tenant; workspaceId, emailHash, roleSet; notification/audit
- Wiersz 4: membership.updated; Authorization; before/after, actor; cache invalidation/audit
- Wiersz 5: integration.connected; Integrations; connectionId, providerId, scopes; initial sync/audit
- Wiersz 6: integration.reauthorization_required; Integrations; connectionId, cause; notification
- Wiersz 7: sync.job.requested; Ingestion; jobId, connectionId, type, range; worker queue
- Wiersz 8: sync.job.completed; Ingestion; counts, checkpoint, duration; normalization
- Wiersz 9: sync.job.failed; Ingestion; errorClass, retryable, attempt; alert/retry
- Wiersz 10: dataset.normalized; Data; datasetId, schemaVersion; canonicalization
- Wiersz 11: dataset.canonicalized; Data; datasetId, ruleVersions, lineageHash; quality
- Wiersz 12: dataset.readiness.changed; Quality; old/new, dimensions, impact; UI/metrics
- Wiersz 13: data.issue.opened; Quality; issueId, severity, affectedScope; assign/notify
- Wiersz 14: data.issue.resolved; Quality; resolution, actor, reprocessRequired; reprocess/audit
- Wiersz 15: metric.snapshot.published; Metrics; metric/version, scope, readiness; cache/insights
- Wiersz 16: metric.definition.changed; Metrics; old/new version, effectiveAt; impact/reprocess
- Wiersz 17: insight.created; Insights; evidenceRefs, confidence, owner; recommendation
- Wiersz 18: recommendation.decided; Decisions; decision, rationale, actor; action/outcome
- Wiersz 19: action.execution.completed; Actions; result, verification, rollbackRef; outcome/audit
- Wiersz 20: ai.analysis.requested; AI; contextRef, policyVersion, budgetClass; AI gateway
- Wiersz 21: ai.analysis.completed; AI; model/prompt, evidenceHash, cost; thread/audit
- Wiersz 22: ai.analysis.blocked; AI; policy reason, data class; audit
- Wiersz 23: subscription.status.changed; Billing; old/new, reason; entitlements
- Wiersz 24: usage.recorded; Billing; meter/version, quantity, sourceRef; aggregation
- Wiersz 25: audit.exported; Audit; scope, actor, purpose; security audit
- Wiersz 26: workspace.deactivation.requested; Lifecycle; scope, retention, actor; approval/job
- Wiersz 27: security.incident.opened; Security; severity, affectedTenant, correlations; incident

## Reguły komunikatów

Komunikat odpowiada: co, zakres, wpływ, next step.

Nie używać samego 'Coś poszło nie tak'.

Nie używać 0 dla braku danych.

Nie nazywać ACTIVE connection gotową analityką.

CorrelationId jest w szczegółach/support.

Cross-tenant error nie ujawnia istnienia zasobu.

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.
