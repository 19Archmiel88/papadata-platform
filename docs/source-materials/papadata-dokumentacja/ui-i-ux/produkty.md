# Produkty

PAPADATA

Produkty

Specyfikacja architektury UI/UX

Tabela:
- Wiersz 1: Metryka; Wartość
- Wiersz 2: Kod dokumentu; M07
- Wiersz 3: Numer modułu; 07 z 15
- Wiersz 4: Wersja; 1.0
- Wiersz 5: Status; Zaakceptowana specyfikacja UI/UX
- Wiersz 6: Data; 18 lipca 2026 roku
- Wiersz 7: Język; polski
- Wiersz 8: Charakter; Model docelowy produktu tworzonego od podstaw

Tabela:
- Wiersz 1: Zasada interpretacji • Dokument określa wymagany model interfejsu i nie stanowi dowodu wdrożenia funkcji, integracji, kontroli ani procesów. • Status decyzji biznesowej jest odrębny od dowodu implementacji i gotowości produkcyjnej. • W przypadku konfliktu źródeł obowiązuje hierarchia dokumentów biznesowych PapaData oraz centralny Rejestr decyzji.

## Informacje o dokumencie

Dokument definiuje architekturę interfejsu modułu „Produkty” jako część platformy PapaData. Zakres obejmuje ekrany, przepływy, stany, formularze, walidacje, mikrocopy, komponenty, Storybook, priorytety, ryzyka oraz decyzje projektowe. Każdy element jest powiązany z potwierdzoną potrzebą biznesową, procesem albo wymaganiem funkcjonalnym; elementy wyprowadzone projektowo są oznaczone jako rekomendacje.

## Podstawa źródłowa

Dokument 1: produkty, warianty i oferty jako obszar niespójności

Dokument 3: obiekty product/variant/SKU/offer/listing, canonicalization i source authority

Dokument 4: zakres danych produktowych providerów

Dokument 7: minimalizacja i tenant isolation

Analizę wykonano w kontekście całego pakietu siedmiu dokumentów źródłowych PapaData oraz przekazanej syntezy UI/UX.

## Oznaczenia

Tabela:
- Wiersz 1: Typ; Znaczenie
- Wiersz 2: Fakt; Wynika bezpośrednio z dokumentacji źródłowej.
- Wiersz 3: Założenie; Potrzebne do zbudowania spójnego flow, lecz niewskazane jednoznacznie.
- Wiersz 4: Rekomendacja; Proponowana decyzja projektowa wynikająca z wymagań.
- Wiersz 5: Decyzja UI/UX do podjęcia; Brak rozstrzygnięcia wpływający na interfejs lub proces.

## Zasady numeracji

Tabela:
- Wiersz 1: Identyfikator; Zakres
- Wiersz 2: M07-E01…; ekrany i widoki
- Wiersz 3: M07-P01…; przepływy użytkownika
- Wiersz 4: M07-F01…; formularze i zestawy danych wejściowych
- Wiersz 5: M07-K01…; komponenty i wzorce UI
- Wiersz 6: M07-R01…; ryzyka UX
- Wiersz 7: M07-D01…; decyzje UI/UX do podjęcia

## Spis treści

1. Wnioski główne

2. Mapa produktu od strony UI/UX

3. Lista wymaganych ekranów

4. Flow użytkownika

5. Stany ekranów

6. Formularze i dane wejściowe

7. Komunikaty i mikrocopy

8. Komponenty i wzorce UI

9. Struktura Storybooka

10. Priorytet MVP

11. Ryzyka UX

12. Luki w dokumentacji

13. Rekomendowana kolejność projektowania

## 1. Wnioski główne

Tabela:
- Wiersz 1: Fakty z dokumentacji • Model danych obejmuje produkt, wariant, SKU, ofertę/listing, kategorię, markę i identyfikatory zewnętrzne. • Produkt źródłowy nie jest automatycznie produktem kanonicznym; relacje między wariantem, SKU i ofertą wymagają jawnego mappingu. • Exact matching ma pierwszeństwo przed fuzzy matching, a fuzzy jest warunkowe i audytowane. • Source authority jest wersjonowane, a deduplikacja nie może przekraczać granicy tenantu. • Braki i konflikty mappingu powinny blokować tylko zależne analizy produktowe.

Tabela:
- Wiersz 1: Założenia • Moduł jest analityczny i nie edytuje katalogu źródłowego w MVP. • Canonical Product może grupować wiele ofert/listingów i wariantów, ale dokładna kardynalność wymaga kontraktu. • Wydajność produktu korzysta z danych zamówień; zapasy i COGS są poza potwierdzonym P0, jeśli źródła ich nie dostarczają.

Tabela:
- Wiersz 1: Rekomendacje • Rozdzielić warstwy: produkt kanoniczny, wariant/SKU oraz oferta/listing u providera. • Każde połączenie lub rozłączenie mappingu ma analizę wpływu na historyczne KPI i wymaga audytu. • Nie ukrywać nieprzypisanych ofert; pokazywać kolejkę mappingu z wpływem. • Fuzzy suggestions traktować jako propozycję, nie automatyczną prawdę.

## 1.1. Konsekwencje dla projektu

Moduł „Produkty” należy projektować jako fragment kompletnego cyklu wartości PapaData: od wiarygodnego kontekstu i danych, przez interpretację, do decyzji, działania i późniejszego pomiaru. Interfejs ma ujawniać zakres, źródła, ograniczenia i następną akcję, a nie sugerować gotowość na podstawie samej obecności danych lub konfiguracji.

## 2. Mapa produktu od strony UI/UX

## 2.1. Role i potrzeby

Tabela:
- Wiersz 1: Rola; Główna potrzeba; Zakres działania
- Wiersz 2: Merchandising/E-commerce Manager; Ocena wyników produktów i ofert.; Analiza, segmentacja, działanie.
- Wiersz 3: Analityk; Powiązanie produktu z zamówieniami i KPI.; Drill-down, porównania.
- Wiersz 4: Data Steward; Mapping, konflikty i duplikaty.; Review i source authority.
- Wiersz 5: Administrator integracji; Zakres pobieranych produktów/ofert.; Sync i diagnostyka.
- Wiersz 6: Użytkownik tylko do odczytu; Wyniki zatwierdzonych produktów.; Brak edycji mappingu.

## 2.2. Pozycja modułu w produkcie

Moduł M07 jest częścią aplikacji klienta PapaData i korzysta z globalnego kontekstu tenanta, workspace, okresu oraz uprawnień. Zmiana kontekstu wymaga ponownej walidacji dostępu. Dane, statusy i działania prezentowane w module muszą być lokalne względem właściwego tenantu i zakresu.

## 2.3. Zależności

Dokument 1: produkty, warianty i oferty jako obszar niespójności

Dokument 3: obiekty product/variant/SKU/offer/listing, canonicalization i source authority

Dokument 4: zakres danych produktowych providerów

Dokument 7: minimalizacja i tenant isolation

Powłoka produktu: nawigacja, pasek kontekstu, powiadomienia i bezpieczny punkt powrotu.

System wspólny: statusy, dostępność, mikrocopy, motywy jasny/ciemny i zachowanie responsywne.

Backend: autoryzacja serwerowa, audyt, wersjonowanie kontraktów i izolacja tenantów.

## 3. Lista wymaganych ekranów

Poniższe ekrany wynikają z potwierdzonych potrzeb, procesów lub wymagań. Nie są dodane „na wszelki wypadek”.

Tabela:
- Wiersz 1: ID i ekran; Cel, użytkownik, akcja; Treści, dane, komponenty; Stany, priorytet, podstawa
- Wiersz 2: M07-E01
Przegląd produktów; Cel: Ocena sprzedaży i gotowości katalogu.
Użytkownik: Manager/analityk
Główna akcja: Otwórz produkt lub problem; Treści: Produkty aktywne, sprzedaż, brak SKU/mappingu, top/bottom, quality.
Dane: Wejście: product + order datasets. Wyjście: detail/issue.
Komponenty: KPI strip; ranked list; trust summary.; Stany: no data, partial, ready, stale, conflict
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 3: M07-E02
Katalog produktów kanonicznych; Cel: Lista wspólnych obiektów biznesowych.
Użytkownik: Analityk/Data Steward
Główna akcja: Otwórz produkt; Treści: Canonical ID, name, brand, category, variants, listings, mapping state, sales.
Dane: Wejście: canonical products. Wyjście: detail/export.
Komponenty: Table; filters; hierarchy; mapping badge.; Stany: loading, empty, partial, no access
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 4: M07-E03
Szczegóły produktu; Cel: Zrozumienie produktu, wariantów, ofert i wyników.
Użytkownik: Manager/analityk
Główna akcja: Otwórz wariant/listing; Treści: Attributes, variants, SKUs, listings, sources, sales trend, limitations.
Dane: Wejście: productId. Wyjście: analysis/action.
Komponenty: Product header; variant tree; performance; Evidence Drawer.; Stany: ready, partial, unmapped listing, conflict
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 5: M07-E04
Mapowanie SKU i wariantów; Cel: Łączenie rekordów źródłowych z obiektem kanonicznym.
Użytkownik: Data Steward
Główna akcja: Zatwierdź mapping; Treści: Source IDs, SKU, attributes, exact/fuzzy evidence, target product, impact.
Dane: Wejście: candidates. Wyjście: versioned mapping/reprocess.
Komponenty: Side-by-side match; confidence evidence; approval.; Stany: exact, suggested, ambiguous, rejected, applied
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 6: M07-E05
Oferty i listingi; Cel: Kontrola relacji product-offer-channel.
Użytkownik: Marketplace Manager
Główna akcja: Otwórz ofertę; Treści: Provider, listing ID, channel, status, linked SKU/product, sales, data quality.
Dane: Wejście: listings. Wyjście: detail/mapping issue.
Komponenty: Table; channel badge; relation graph.; Stany: unmapped, inactive, duplicate, partial
Priorytet: P1
Podstawa: Fakt.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 7: M07-E06
Wydajność produktu; Cel: Analiza sprzedaży produktu w czasie i kanałach.
Użytkownik: Manager
Główna akcja: Utwórz obserwację; Treści: Orders, Gross Revenue, refunds, channels, variants, period, trust.
Dane: Wejście: product-order contributions. Wyjście: observation/decision.
Komponenty: Trend; breakdown; trust; compare.; Stany: ready, partial, no comparable period, source change
Priorytet: P1
Podstawa: Rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 8: M07-E07
Kolejka braków katalogu; Cel: Rozwiązanie brakujących SKU, nazw, kategorii i relacji.
Użytkownik: Data Steward
Główna akcja: Przypisz ownera/rozwiąż; Treści: Issue type, records, impact on KPI, suggested resolution, owner.
Dane: Wejście: quality issues. Wyjście: mapping/review.
Komponenty: Issue queue; bulk select with limits; impact.; Stany: open, waiting, resolved, escalated
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.
- Wiersz 9: M07-E08
Analiza wpływu zmiany mappingu; Cel: Pokazanie skutków przed zatwierdzeniem.
Użytkownik: Data Steward/Owner
Główna akcja: Zatwierdź i przelicz; Treści: Affected periods, orders, KPIs, products, expected deltas, reprocessing scope.
Dane: Wejście: mapping change. Wyjście: approval/job.
Komponenty: Impact summary; before/after estimate; reauth if critical.; Stany: calculating, no impact, material impact, conflict, failed
Priorytet: P1
Podstawa: Fakt + rekomendacja.
Uzasadnienie: wspiera potwierdzony proces modułu.

## 3.1. Zasada ograniczania liczby ekranów

Warianty tego samego celu należy realizować jako stany, panele kontekstowe, zakładki lub modale. Osobny ekran jest uzasadniony dopiero wtedy, gdy użytkownik zmienia cel, odpowiedzialność, zakres danych albo punkt decyzyjny.

## 4. Flow użytkownika

## 4.1. M07-P01 — Produkt do wyniku

Punkt startowy: Użytkownik otwiera produkt z overview.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Product detail
- Wiersz 3: 2; Check variants/listings
- Wiersz 4: 3; Performance trend
- Wiersz 5: 4; Trust/evidence
- Wiersz 6: 5; Compare period/channel
- Wiersz 7: 6; Create observation/action

Punkty decyzyjne:

Mapping complete?

KPI ready?

Channel comparable?

Błędy i blokery:

Unmapped listing

Partial orders

Category changed

Sukces: Interpretowalny wynik produktowy.

Ścieżki alternatywne:

Go to mapping

Data issue

Export

## 4.2. M07-P02 — Mapowanie SKU

Punkt startowy: Unmapped or ambiguous source record.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Open candidate
- Wiersz 3: 2; Inspect exact keys/attributes
- Wiersz 4: 3; Review suggestions
- Wiersz 5: 4; Choose canonical target or create candidate
- Wiersz 6: 5; Impact analysis
- Wiersz 7: 6; Approve
- Wiersz 8: 7; Reprocess affected scope

Punkty decyzyjne:

Exact match?

Fuzzy allowed?

New canonical product needed?

Błędy i blokery:

Ambiguous

Cross-tenant candidate

Missing attributes

No capability

Sukces: Versioned mapping and updated KPIs.

Ścieżki alternatywne:

Leave unresolved

Escalate

Reject suggestion

## 4.3. M07-P03 — Zmiana source authority produktu

Punkt startowy: Conflict between sources.

Tabela:
- Wiersz 1: Krok; Przebieg
- Wiersz 2: 1; Open conflict
- Wiersz 3: 2; Compare values
- Wiersz 4: 3; Review current authority
- Wiersz 5: 4; Set scope/period
- Wiersz 6: 5; Impact analysis
- Wiersz 7: 6; Approval
- Wiersz 8: 7; Reprocess
- Wiersz 9: 8; Audit

Punkty decyzyjne:

Field/object scope?

Historical effect?

Second approval?

Błędy i blokery:

Overlapping rule

No owner

Reprocess failed

Sukces: Active versioned rule with evidence.

Ścieżki alternatywne:

Keep current rule

Limit to future data

Escalate

## 4.4. Zasada powrotu do przerwanego procesu

Procesy wieloetapowe zapisują ostatni bezpiecznie ukończony krok. Po ponownym wejściu system odtwarza kontekst dopiero po rewalidacji sesji, tenantu, workspace i capability; danych z poprzedniego kontekstu nie wolno przenosić automatycznie.

## 5. Stany ekranów

Stany są elementem kontraktu produktu, a nie dekoracją. Każdy stan powinien komunikować: co się stało, jaki zakres obejmuje, jaki jest wpływ i co należy zrobić.

Tabela:
- Wiersz 1: Stan; Zachowanie w module; Wymaganie projektowe
- Wiersz 2: Domyślny; Treść dostępna zgodnie z rolą, aktywnym workspace i wybranym zakresem.; Główna akcja jest jednoznaczna; status i zakres są widoczne.
- Wiersz 3: Ładowanie; Szkielet treści; niezależne ładowanie paneli; zachowanie nagłówka kontekstu.; Nie ukrywać wcześniej znanych danych bez potrzeby.
- Wiersz 4: Pusty; Brak elementów w obszarze „Produkty” albo brak ukończonej konfiguracji.; Wyjaśnić przyczynę oraz wskazać jedną następną akcję.
- Wiersz 5: Częściowe dane; Pokazać wyłącznie wiarygodny zakres, kompletność i listę braków.; Stan nie może wizualnie przypominać gotowego wyniku.
- Wiersz 6: Błąd; Klasa błędu, zakres, wpływ biznesowy, identyfikator i dostępna ścieżka naprawy.; Rozdzielić retry użytkownika, administratora i Supportu.
- Wiersz 7: Brak dostępu; Neutralna informacja bez ujawniania zawartości obiektu.; Wskazać wymaganą rolę lub administratora; autoryzacja po stronie serwera.
- Wiersz 8: Sukces; Potwierdzenie faktycznego rezultatu i następnego kroku.; Nie ograniczać sukcesu do znikającego toastu.
- Wiersz 9: Ostrzeżenie; Kontekst, zakres, wpływ na dane/KPI i możliwość rozwinięcia dowodów.; Kolor nie jest jedynym nośnikiem znaczenia.
- Wiersz 10: Wygasła sesja; Ponowne logowanie z zachowaniem bezpiecznego punktu powrotu.; Po zalogowaniu ponownie zweryfikować tenant, workspace i capability.
- Wiersz 11: Wygasły link; Link nie umożliwia dostępu; podać bezpieczny sposób wygenerowania nowego.; Nie ujawniać danych tenanta ani odbiorcy ponad minimum.
- Wiersz 12: Przetwarzanie; Widoczny etap, zakres, czas rozpoczęcia i możliwość opuszczenia ekranu.; Operacje asynchroniczne muszą być dostępne później w historii.
- Wiersz 13: Oczekiwanie na dane; Źródło oczekiwania, właściciel i kolejna kontrola.; Brak danych nie może być reprezentowany jako zero.
- Wiersz 14: Konflikt danych; Konkurencyjne wartości, dowody, wpływ i właściciel rozstrzygnięcia.; Blokada tylko dla zależnego zakresu/KPI.
- Wiersz 15: Nieukończona konfiguracja; Lista brakujących elementów i zależności.; Nie deklarować gotowości, dopóki wymagania nie są spełnione.
- Wiersz 16: Dane nieaktualne; Ostatni poprawny stan i zakres nadal wiarygodny.; Stale nie usuwa historii, ale wymaga wyraźnej daty aktualności.
- Wiersz 17: Wymaga administratora; Akcja jest widoczna, lecz niedostępna; podać wymaganą rolę.; Nie proponować obejścia uprawnień.
- Wiersz 18: Problem bezpieczeństwa; Bezpieczny komunikat klientowski i ograniczenie tylko właściwego zakresu.; Pełna diagnostyka wyłącznie dla uprawnionych osób.

## 5.1. Model statusu złożonego

Interfejs powinien syntetyzować stan z wymiarów: zakres, faza, dostęp, gotowość, problem, wynik, czas, integralność, wpływ biznesowy i następna akcja. Użytkownik widzi najpierw status biznesowy, następnie wpływ, a szczegóły techniczne dopiero po rozwinięciu.

## 6. Formularze i dane wejściowe

## 6.1. M07-F01 — Mapowanie SKU/wariantu

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Source record
• Canonical product
• Variant
• Match type
• Evidence
• Reason
• Effective date
• Reprocess scope
- Wiersz 3: Walidacje; • Same tenant
• Exact first
• Reason required
• No overlapping active mapping
- Wiersz 4: Błędy; • Ambiguous target
• Missing SKU
• Cross-tenant block
• Impact unavailable
- Wiersz 5: Sukces; Versioned mapping.
- Wiersz 6: Zależności backendowe; Mapping service, lineage, reprocessing.
- Wiersz 7: Ryzyka UX; Suggestion must not auto-apply.

## 6.2. M07-F02 — Nowy produkt kanoniczny

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Name
• Brand
• Category
• Variants
• Identifiers
• Owner
• Reason
- Wiersz 3: Walidacje; • Avoid duplicate exact identifiers
• Required owner
• Controlled vocabularies
- Wiersz 4: Błędy; • Duplicate candidate
• Invalid identifier
• Missing minimum fields
- Wiersz 5: Sukces; Canonical candidate pending/active.
- Wiersz 6: Zależności backendowe; Canonical model, review workflow.
- Wiersz 7: Ryzyka UX; UI creation does not mean source catalog creation.

## 6.3. M07-F03 — Filtry wydajności produktu

Tabela:
- Wiersz 1: Obszar; Specyfikacja
- Wiersz 2: Pola; • Period
• Channel
• Source
• Category
• Brand
• Variant
• Quality state
- Wiersz 3: Walidacje; • Comparable period
• Currency policy
• Data completeness visible
- Wiersz 4: Błędy; • No data
• Mixed currency
• Mapping changed
- Wiersz 5: Sukces; Jawny analytical view.
- Wiersz 6: Zależności backendowe; Product-order query, KPI versions.
- Wiersz 7: Ryzyka UX; Ranking cannot mix incomparable scope.

## 6.5. Zasady wspólne formularzy

Walidacja klientowa wspiera użytkownika, lecz decyzja o dostępie i integralności jest serwerowa.

Błędy są przypisane do pola lub kroku; komunikat globalny zawiera wpływ i dalsze działanie.

Dane wrażliwe i sekrety są write-only i nie wracają w interfejsie.

Operacje istotne wymagają podsumowania wpływu, potwierdzenia, a w razie potrzeby reautoryzacji/MFA.

Po sukcesie interfejs pokazuje rezultat procesu i kolejny krok, nie tylko toast.

## 7. Komunikaty i mikrocopy

Mikrocopy odpowiada na cztery pytania: co się stało, czego dotyczy, jaki jest wpływ oraz kto i co powinien zrobić.

Tabela:
- Wiersz 1: Kontekst; Rekomendowany komunikat
- Wiersz 2: Unmapped; Ta oferta nie jest przypisana do produktu kanonicznego i nie zasila analiz produktowych.
- Wiersz 3: Fuzzy suggestion; System znalazł podobny produkt. To propozycja wymagająca zatwierdzenia.
- Wiersz 4: Exact match; Identyfikatory źródłowe wskazują jednoznaczne dopasowanie.
- Wiersz 5: Impact; Zmiana mappingu może zmienić wyniki 1 248 zamówień z dwóch okresów.
- Wiersz 6: Read-only; Zmiana w PapaData dotyczy mappingu analitycznego, nie katalogu źródłowego.
- Wiersz 7: Conflict; Dwa źródła podają inną markę. Sprzedaż pozostaje dostępna; segmentacja marki jest zablokowana.
- Wiersz 8: No cost; Brak potwierdzonego kosztu produktu; nie pokazujemy marży jako kompletnej.
- Wiersz 9: Reprocessing; Mapping zapisany. Trwa przeliczanie zależnych wyników.

## 7.1. Reguły językowe

Nie używać ogólnego „Coś poszło nie tak” bez klasy błędu i dalszego kroku.

Nie nazywać połączenia źródła gotową integracją ani pobrania rekordów gotowym KPI.

Brak danych oznaczać jako brak lub nieznane, nigdy jako domyślne 0.

Unikać wyłącznie wielkich liter; pogrubienie stosować umiarkowanie.

Nazwy techniczne providerów i statusów objaśniać językiem wpływu biznesowego.

## 8. Komponenty i wzorce UI

Tabela:
- Wiersz 1: ID; Komponent / wzorzec; Odpowiedzialność; Minimalne warianty
- Wiersz 2: M07-K01; Drzewo produkt-wariant-oferta; Hierarchia obiektów i kanałów.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 3: M07-K02; Znacznik stanu mapowania; Mapped/unmapped/ambiguous/conflict.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 4: M07-K03; Porównanie dopasowania; Exact keys, attributes, evidence.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 5: M07-K04; Karta propozycji dopasowania rozmytego; Suggestion with reasons and warning.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 6: M07-K05; Nagłówek wyników produktu; Sales KPI + trust.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 7: M07-K06; Wiersz oferty; Provider, channel, relation, status.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 8: M07-K07; Analiza wpływu; Affected records, periods, KPIs.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 9: M07-K08; Historia mapowania; Versions, owner, reason, effective date.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu
- Wiersz 10: M07-K09; Kolejka problemów katalogu; Issue, impact, owner, next action.; Jasny, Ciemny, Ładowanie, Pusty, Częściowy, Błąd, Brak dostępu

## 8.1. Wzorce przekrojowe

Tabela:
- Wiersz 1: Wzorzec; Zastosowanie
- Wiersz 2: Nagłówek zaufania; Gotowość, świeżość, kompletność, integralność, walidacja i ograniczenia.
- Wiersz 3: Banner wpływu biznesowego; Tłumaczy problem techniczny na wpływ dla bieżącego zakresu.
- Wiersz 4: Pasek następnej akcji; Jedna dominująca akcja wynikająca ze stanu.
- Wiersz 5: Inspektor statusu; Rozwijane szczegóły fazy, dostępu, gotowości, problemu i integralności.
- Wiersz 6: Szuflada dowodów; Definicja, źródła, lineage, wersja i ograniczenia.
- Wiersz 7: Pasek operacji asynchronicznej; Etap, zakres, start i link do historii procesu.
- Wiersz 8: Wzorzec zatwierdzenia człowieka; Podgląd wpływu, odpowiedzialny, reautoryzacja, wynik i audyt.

## 8.2. Wykresy i hierarchia

Wykres pokazuje okres, porównanie, gotowość, przerwy w danych i zmianę definicji.

Nie interpolować brakujących okresów jako zera.

Wykres musi prowadzić do źródeł, ograniczeń albo decyzji.

Stosować separatory, warstwy, osadzone panele i command-center zamiast ciężkich, równorzędnych kart.

Przewidzieć jasny i ciemny motyw oraz nasycone, lecz nieneonowe kolory semantyczne.

## 9. Struktura Storybooka

Storybook ma prezentować kompletne scenariusze i stany, a nie tylko oderwane komponenty. Nazwy folderów, historii i wariantów pozostają po polsku.

Tabela:
- Wiersz 1: Typ; Polska nazwa w Storybooku
- Wiersz 2: Folder; Produkty/Przegląd
- Wiersz 3: Folder; Produkty/Katalog
- Wiersz 4: Folder; Produkty/Szczegóły
- Wiersz 5: Folder; Produkty/Mapowanie
- Wiersz 6: Folder; Produkty/Oferty
- Wiersz 7: Folder; Produkty/Wydajność
- Wiersz 8: Folder; Produkty/Kolejka_braków
- Wiersz 9: Folder; Produkty/Analiza_wpływu
- Wiersz 10: Historia; Katalog/Pusty
- Wiersz 11: Historia; Szczegóły/Nieprzypisana_oferta
- Wiersz 12: Historia; Mapowanie/Dopasowanie_dokładne
- Wiersz 13: Historia; Mapowanie/Niejednoznaczne
- Wiersz 14: Historia; Mapowanie/Propozycja_rozmyte
- Wiersz 15: Historia; Wydajność/Dane_częściowe
- Wiersz 16: Historia; Wpływ/Materialna_zmiana
- Wiersz 17: Historia; Przepływy/Mapowanie_do_reprocessingu
- Wiersz 18: Wariant; D2C
- Wiersz 19: Wariant; Platforma_handlowa
- Wiersz 20: Wariant; Wiele_kanałów
- Wiersz 21: Wariant; Bez_kategorii
- Wiersz 22: Wariant; Bez_kosztu
- Wiersz 23: Wariant; Tylko_odczyt
- Wiersz 24: Wariant; Długi_nazwa
- Wiersz 25: Wariant; Wygasła_sesja

## 9.1. Minimalny kontrakt historii

Kontekst roli, tenanta i workspace.

Dane wejściowe i stan domenowy.

Akcja użytkownika i spodziewana odpowiedź.

Wariant jasny i ciemny.

Obsługa klawiatury, fokusu i wysokiego kontrastu.

Stany: domyślny, ładowanie, pusty, częściowy, błąd, brak dostępu, sukces i wygasła sesja.

Pełny flow od punktu startowego do sukcesu oraz ścieżki błędu.

## 10. Priorytet MVP

Tabela:
- Wiersz 1: Priorytet; Zakres
- Wiersz 2: P0; Podstawowy model produktu w danych; UI poza minimalnym order detail.
- Wiersz 3: P1; Catalog, detail, mapping exact, listings, performance, issues, impact/reprocessing.
- Wiersz 4: P2; Controlled fuzzy matching, bulk mapping, advanced merchandising analytics.

## 10.1. Kryterium wejścia do MVP

Element może wejść do MVP tylko wtedy, gdy ma potwierdzony cel biznesowy, właściciela, dane wejściowe, kontrakt stanów, ścieżkę błędu, kontrolę dostępu i mierzalny rezultat. Brak dowodu gotowości technicznej pozostaje jawny.

## 10.2. Kryterium wyjścia

MVP modułu jest ukończone dopiero po przejściu pełnego scenariusza w Storybooku/prototypie, weryfikacji stanów krytycznych, dostępności, zachowania dla częściowych danych oraz spójności z powłoką i systemem zaufania.

## 11. Ryzyka UX

Tabela:
- Wiersz 1: ID; Ryzyko; Skutek; Odpowiedź interfejsu
- Wiersz 2: M07-R01; Produkt=oferta; Błędna agregacja.; Oddzielne warstwy.
- Wiersz 3: M07-R02; Fuzzy auto-merge; Błędne łączenie.; Human review.
- Wiersz 4: M07-R03; Mapping bez impact; Historyczne KPI się zmieniają niejawnie.; Impact + reprocessing.
- Wiersz 5: M07-R04; Unmapped ukryte; Zawyżona kompletność.; Visible queue and exclusion.
- Wiersz 6: M07-R05; Brak kosztu jako zero; Fałszywa marża.; Unknown/blocked margin.
- Wiersz 7: M07-R06; Cross-tenant matching; Data breach.; Tenant-scoped candidates.

## 11.1. Zasada zarządzania ryzykiem

Ryzyka o wpływie na bezpieczeństwo, tenant isolation, definicje KPI, płatności, dane osobowe lub wykonanie działania wymagają wyraźnej kontroli, dowodu, właściciela i audytu. Sam komunikat ostrzegawczy nie zastępuje kontroli.

## 12. Luki w dokumentacji

Tabela:
- Wiersz 1: ID; Temat; Klasyfikacja; Rozstrzygnięcie potrzebne; Wpływ
- Wiersz 2: M07-D01; Canonical product schema; Luka; Fields and cardinality.; Catalog/detail.
- Wiersz 3: M07-D02; Create canonical product; Decyzja UI/UX do podjęcia; Who and when.; Review flow.
- Wiersz 4: M07-D03; Fuzzy thresholds; Decyzja późniejsza; Algorithms and approval.; P2 risk.
- Wiersz 5: M07-D04; Category taxonomy; Luka; Source vs common categories.; Filters/analysis.
- Wiersz 6: M07-D05; Cost data; Luka; Source authority and scope.; Margin.
- Wiersz 7: M07-D06; Listing statuses; Luka; Provider mappings.; Offers view.
- Wiersz 8: M07-D07; Bulk actions; Decyzja UI/UX do podjęcia; Limits and rollback.; Operational scale.

## 12.1. Zasady podejmowania decyzji

Decyzję zapisać w centralnym Rejestrze decyzji, jeśli zmienia kierunek biznesowy lub produktowy.

Dla decyzji warunkowej określić zakres obowiązywania, dowód i zdarzenie ponownej oceny.

Nie oznaczać decyzji jako wdrożonej bez osobnego dowodu realizacji.

Zmiana mająca wpływ na dane historyczne, KPI lub uprawnienia wymaga analizy wpływu i wersjonowania.

## 13. Rekomendowana kolejność projektowania

Finalize product/variant/SKU/listing model.

Design canonical catalog and detail.

Design exact mapping and evidence.

Add unmapped/conflict queue.

Design impact and reprocessing.

Connect product performance to orders.

Only then fuzzy/bulk workflows.

Zbudować kompletne scenariusze i stany w Storybooku, łącznie z błędami oraz brakiem dostępu.

Przeprowadzić przegląd spójności z powłoką produktu, systemem statusów, bezpieczeństwem i kontraktem danych.

Dopiero po zatwierdzeniu flow i stanów przejść do finalnej hierarchii wizualnej i layoutów.

## 13.1. Brama projektowa

Tabela:
- Wiersz 1: Warunek rozpoczęcia finalnych layoutów • Zatwierdzona mapa ról, uprawnień i kontekstu tenant/workspace. • Zatwierdzony katalog ekranów i identyfikatorów. • Przetestowany prototyp głównego flow wraz ze stanami częściowymi i błędami. • Rozstrzygnięte decyzje krytyczne albo jawnie przyjęte założenia warunkowe. • Spójność nazewnictwa komponentów i historii Storybooka w języku polskim.

## Rejestr źródeł wykorzystanych w analizie

Dokument 1 — Dokumentacja biznesowo-produktowa PapaData

Dokument 2 — Rejestr decyzji i wymagań biznesowych

Dokument 3 — Kontrakt danych, stanów i KPI

Dokument 4 — Integracje i gotowość operacyjna

Dokument 5 — Pierwszy pion produktowy i płatny pilotaż

Dokument 6 — Model komercyjny i unit economics

Dokument 7 — Bezpieczeństwo, prywatność i AI Governance

Synteza architektury UI/UX PapaData przekazana w materiale roboczym

Koniec dokumentu.
