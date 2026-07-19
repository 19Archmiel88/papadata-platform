# Architektura AI i analityki decyzyjnej

PAPADATA

Architektura AI i analityki decyzyjnej

Evidence, retrieval, governance, koszt i human oversight

Tabela:
- Wiersz 1: Kod dokumentu; A11
- Wiersz 2: Wersja; 1.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Zaprojektować Papa Asystenta jako kontrolowaną warstwę analityczną i decyzyjną. [FAKT/ZAKRES]

Zakres: Use cases, evidence pack, retrieval, output, safety, cost, evals, actions i UI. [FAKT/ZAKRES]

Poza zakresem: Trening własnego modelu i autonomiczne high-impact actions. [OGRANICZENIE]

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

## Zakres AI

Tabela:
- Wiersz 1: Use case; MVP; Warunek
- Wiersz 2: Interpretacja pojedynczego KPI; Tak; READY lub zaakceptowany PARTIAL + evidence
- Wiersz 3: Wyjaśnienie jakości danych; Tak; Issue/Readiness dostępne
- Wiersz 4: Rekomendacja do decyzji; Tak ograniczone; owner, impact, expiry, review
- Wiersz 5: Otwarte pytania na wszystkich danych; Nie; brak granic/kosztu
- Wiersz 6: AI Lab; Etap 2; sandbox, budget, capability
- Wiersz 7: External action; Etap 2; approval, allowlist, reversibility
- Wiersz 8: Autonomous budget optimization; Później/poza; wysokie ryzyko

## Przepływ odpowiedzi

User inicjuje analizę w kontekście ekranu/KPI.

Backend ocenia capability, entitlement, data class i use case.

Retrieval pobiera tylko dozwolone snapshoty/definitions/issues.

Readiness gate odrzuca lub ogranicza.

Gateway buduje versioned evidence pack i budget.

Model generuje structured output; validator kontroluje schema/tools/evidence.

UI rozdziela facts, inferences, recommendations, limitations, evidence.

Recommendation trafia do Decision Service; AI nie podejmuje decyzji.

Run zapisuje model/prompt/policy/evidence hash/cost.

## Kontrakt odpowiedzi

Tabela:
- Wiersz 1: Sekcja; Wymaganie
- Wiersz 2: facts; tylko twierdzenia wspierane przez evidence
- Wiersz 3: inferences; jawne wnioski i uncertainty
- Wiersz 4: recommendations; impact, owner, reversibility, expiry
- Wiersz 5: limitations; missing/partial/stale/scope/prohibitions
- Wiersz 6: evidence; snapshot/dataset/definition IDs i czas
- Wiersz 7: nextActions; allowlisted types + approval
- Wiersz 8: modelRun; model/prompt/policy versions + cost

## Stany AI

Tabela:
- Wiersz 1: Stan; Warunek; UI
- Wiersz 2: DISABLED; AI wyłączone dla workspace/planu/use case; Wyjaśnij warunek włączenia
- Wiersz 3: INSUFFICIENT_DATA; Brak danych spełniających kontrakt; Nie generuj pewnej odpowiedzi
- Wiersz 4: GENERATING; Trwa retrieval i generowanie; Streaming z anulowaniem
- Wiersz 5: ANSWERED; Odpowiedź powiązana z dowodami; Rozdziel fakty/wnioski/rekomendacje
- Wiersz 6: NEEDS_REVIEW; Rekomendacja/działanie wymaga człowieka; Owner, wpływ, odwracalność, termin
- Wiersz 7: REJECTED; Człowiek odrzucił rekomendację; Zachowaj rationale i audyt
- Wiersz 8: EXPIRED; Zmieniły się dane lub minął termin; Wymuś ponowną analizę
- Wiersz 9: PROVIDER_ERROR; Błąd modelu/gateway; Bezpieczny retry bez utraty kontekstu
- Wiersz 10: BLOCKED_BY_POLICY; Use case, dane lub akcja niedozwolone; Brak obejścia przez prompt

## Bezpieczeństwo AI

Tabela:
- Wiersz 1: Ryzyko; Kontrola
- Wiersz 2: Prompt injection; instruction/data separation, classification, tool allowlist
- Wiersz 3: Cross-tenant retrieval; policy/scope before query, tenant filter
- Wiersz 4: Sensitive disclosure; redaction/minimization/output validation
- Wiersz 5: Hallucination; structured answer, evidence, refusal
- Wiersz 6: Excessive agency; human approval, action service, revalidation
- Wiersz 7: Unbounded cost; budgets/rate/context/output limits
- Wiersz 8: Model drift; pinned config, eval, canary, run metadata
- Wiersz 9: Unsafe retention; retention class and deletion workflow

## Ewaluacje

Faithfulness: facts mają evidence.

Refusal correctness: no data/invalid/forbidden.

Tenant safety: retrieval z ID innego workspace.

Recommendation quality: owner/impact/expiry.

Output schema i no forbidden tools.

Koszt/latency per use case.

Human review acceptance/rejection i rationale.

## Storybook AI

INSUFFICIENT_DATA z brakującymi danymi.

ANSWERED z facts/inferences/recommendation/evidence.

PARTIAL accepted z limitation.

NEEDS_REVIEW dla high impact.

EXPIRED po zmianie snapshotu.

PROVIDER_ERROR z retry.

BLOCKED_BY_POLICY bez disclosure.

Streaming cancelled/resume.

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.
