# Architektura danych jakości i KPI

PAPADATA

Architektura danych, jakości i KPI

Source, normalizacja, canonicalization, lineage, readiness i obliczenia

Tabela:
- Wiersz 1: Kod dokumentu; A07
- Wiersz 2: Wersja; 1.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Zapewnić, że KPI opiera się na jednym kanonicznym fakcie, znanej jakości i wersji. [FAKT/ZAKRES]

Zakres: Pipeline, warstwy, source authority, dedupe, quality/readiness, reprocessing i metric contracts. [FAKT/ZAKRES]

Poza zakresem: Finalne formuły wszystkich KPI i wybór silnika analitycznego. [OGRANICZENIE]

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

## Warstwy danych

Tabela:
- Wiersz 1: Warstwa; Cel; Operacje; Nie oznacza
- Wiersz 2: Source; Zachować dane i semantykę providera; append/version/validate envelope; prawdy biznesowej
- Wiersz 3: Raw normalized; Ujednolicić typy/daty/waluty; parse/basic validation; dedupe/gotowości
- Wiersz 4: Canonical; Wspólny fakt biznesowy; authority/mapping/dedupe/lineage; gotowego KPI
- Wiersz 5: Dataset/read model; Lokalny zakres analizy; assessment/projections; globalnej gotowości
- Wiersz 6: Metric snapshot; Wynik KPI z wersją/readiness; publish/invalidate/recompute; niezmienności po rule change

## Pipeline

Ingestion zapisuje batch, source record/ref, contract version i checkpoint.

Normalizacja waliduje schema/typy, ale nie wybiera authority.

Overlap detection identyfikuje ten sam fakt w źródłach.

Source authority i exact matching określają wkład kanoniczny.

Fuzzy matching działa tylko dla zatwierdzonego use case/progu i manual review.

Canonicalization zapisuje lineage i rule versions.

Quality ocenia completeness, freshness, integrity, conflict i impact.

Readiness określa dozwolone KPI/okresy.

Metric Engine publikuje snapshot z definition version.

Rule change może invalidować snapshot i uruchomić reprocess.

## Model readiness

Tabela:
- Wiersz 1: Stan; Znaczenie; UI
- Wiersz 2: NO_DATA; Nie pobrano użytecznych rekordów; Nie pokazuj 0; wskaż źródło i krok
- Wiersz 3: INGESTING; Trwa pobieranie; Postęp; KPI niedostępne
- Wiersz 4: PARTIAL; Część zakresu użyteczna; Wpływ i lista KPI dozwolonych/zablokowanych
- Wiersz 5: DELAYED; Dane przekraczają próg świeżości; Ostatni poprawny punkt i wpływ
- Wiersz 6: INVALID; Naruszenie schematu/integralności; Blokada zależnych KPI i issue
- Wiersz 7: PROCESSING; Normalizacja/canonicalization/reprocessing; Wersja reguły i operationId
- Wiersz 8: READY; Spełnione warunki lokalnej gotowości; Zakres, okres, waluta, wersje
- Wiersz 9: RESYNC_REQUIRED; Wymagana ponowna synchronizacja; Powód, wpływ, owner i akcja
- Wiersz 10: BLOCKED; Blokada polityki/bezpieczeństwa/konfliktu; Brak obejścia w UI

## Kontrakt MetricDefinition

Tabela:
- Wiersz 1: Pole; Znaczenie
- Wiersz 2: metricCode/version; stabilny kod i wersja
- Wiersz 3: businessDefinition; znaczenie i interpretacja
- Wiersz 4: formulaRef/testVectors; deterministyczna formuła i przykłady
- Wiersz 5: requiredDatasets/fields; minimalne wejścia
- Wiersz 6: sourcePolicy; dozwolone źródła/authority
- Wiersz 7: scopeDimensions; workspace/period/currency/channel/product
- Wiersz 8: readinessRule; READY/PARTIAL/BLOCKED
- Wiersz 9: missingDataPolicy; brak vs zero
- Wiersz 10: currency/timezonePolicy; konwersja i punkt czasu
- Wiersz 11: validFrom/validTo; czas obowiązywania
- Wiersz 12: reprocessingPolicy; wpływ zmiany
- Wiersz 13: owner/approver; odpowiedzialność

## Quality rules MVP

Tabela:
- Wiersz 1: Kategoria; Reguła; Wpływ
- Wiersz 2: Schema; required field/type mismatch; INVALID/blokada
- Wiersz 3: Completeness; brak zamówień w okresie; NO_DATA/PARTIAL
- Wiersz 4: Freshness; lag ponad próg; DELAYED/STALE
- Wiersz 5: Uniqueness; duplikat provider+externalId+version; technical dedupe
- Wiersz 6: Overlap; ten sam fakt przez OMS i marketplace; authority/manual review
- Wiersz 7: Financial integrity; line totals != total poza tolerancją; issue/blokada KPI
- Wiersz 8: Currency; brak currency/rate policy; brak agregacji
- Wiersz 9: Status mapping; nieznany status; partial/reprocess
- Wiersz 10: Lineage; brak canonical-source link; INVALID dla audytowalnych KPI

## Reprocessing i rekoncyliacja

Reprocess jest nowym jobem z ruleVersion, range i reason.

Przed publikacją nowej wersji KPI powstaje old/new impact report.

Reconciliation pokazuje source totals, canonical totals, excluded i reason codes.

UI oznacza definition change i okresy oczekujące.

Metering bazuje na jednostkach kanonicznych po dedupe.

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.
