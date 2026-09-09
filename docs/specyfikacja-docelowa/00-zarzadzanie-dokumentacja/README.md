---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Zarządzanie dokumentacją, rejestry i bramy akceptacyjne

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-01-indeks-dokumentacji-docelowej"></a>

## Indeks dokumentacji docelowej

### Zakres

Dokumentacja rozdziela fundamenty, komponenty, wzorce, powierzchnie Auth, ekrany domenowe, przepływy, kontrakty API, security i mobile. Indeks plikowy znajduje się również w `MANIFEST.json`.

### Główne sekcje

- [00-zarzadzanie-dokumentacja](../00-zarzadzanie-dokumentacja/)
- [01-fundamenty](../01-fundamenty/)
- [02-tla-i-powierzchnie](../02-tla-i-powierzchnie/)
- [03-dostep-rejestracja-onboarding](../03-dostep-rejestracja-onboarding/)
- [04-komponenty-bazowe](../04-komponenty-bazowe/)
- [05-wykresy-i-wizualizacje](../05-wykresy-i-wizualizacje/)
- [06-powloka-produktu-i-nawigacja](../06-powloka-produktu-i-nawigacja/)
- [07-centrum-dowodzenia](../07-centrum-dowodzenia/)
- [08-kampanie-platne](../08-kampanie-platne/)
- [09-zamowienia](../09-zamowienia/)
- [10-produkty](../10-produkty/)
- [11-klienci](../11-klienci/)
- [12-ruch-i-lejek](../12-ruch-i-lejek/)
- [13-integracje-i-synchronizacja](../13-integracje-i-synchronizacja/)
- [14-jakosc-danych-i-integralnosc](../14-jakosc-danych-i-integralnosc/)
- [15-papa-asystent-i-laboratorium-ai](../15-papa-asystent-i-laboratorium-ai/)
- [16-ustawienia-zespol-bezpieczenstwo](../16-ustawienia-zespol-bezpieczenstwo/)
- [17-subskrypcja-i-platnosci](../17-subskrypcja-i-platnosci/)
- [18-wsparcie-marketingowe-decyzje-dzialania](../18-wsparcie-marketingowe-decyzje-dzialania/)
- [19-centrum-pomocy](../19-centrum-pomocy/)
- [20-przeplywy-e2e](../20-przeplywy-e2e/)
- [21-stany-przekrojowe](../21-stany-przekrojowe/)
- [22-mapy-i-indeksy](../22-mapy-i-indeksy/)
- [23-bezpieczenstwo-platformy](../23-bezpieczenstwo-platformy/)
- [24-aplikacja-mobilna](../24-aplikacja-mobilna/)
- [25-kontrakty-domenowe-i-api](../25-kontrakty-domenowe-i-api/)
- [26-priorytety-p0](../26-priorytety-p0/)
- [27-pakiet-prawny-i-organizacyjny](../27-pakiet-prawny-i-organizacyjny/)

### Macierze

- [Ekrany](../../../macierze/ekrany.csv)
- [Ekran–komponent](../../../macierze/ekran-komponent.csv)
- [Ekran–dane–API](../../../macierze/ekran-dane-api.csv)
- [Ekran–rola–uprawnienie](../../../macierze/ekran-rola-uprawnienie.csv)
- [Ekran–Storybook–test](../../../macierze/ekran-storybook-test.csv)


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-07-rejestr-decyzji-docelowych"></a>

## Rejestr decyzji docelowych

| ID | Decyzja |
| --- | --- |
| DEC-001 | Nowa dokumentacja format legacy jest kontraktem docelowym; kod/snapshot jest dowodem stanu obecnego. |
| DEC-002 | Tenant jest granicą izolacji; workspace granicą operacyjną wewnątrz tenanta. |
| DEC-003 | Przeglądarka wywołuje BFF `/api/v1`; operation IDs są źródłem śledzalności ekran–API. |
| DEC-004 | Nie istnieją runtime endpointy `/storybook/*` ani `/flows/*`. |
| DEC-005 | Inter i JetBrains Mono pozostają stanem docelowym do osobnej decyzji migracyjnej. |
| DEC-006 | Jakość danych jest dostępna w grupie „Dane i integracje”, z deep linków statusu i bezpośrednio dla Data Steward. |
| DEC-007 | Każdy ekran jest kompozycją kontraktów komponentów; lokalny duplikat wymaga ADR. |
| DEC-008 | Security i mobile zachowują pełne pakiety źródłowe, nie skrócone streszczenia. |
| DEC-009 | Wszystkie 58 metryk należą do MVP i jednego backendowego Metric Engine. |
| DEC-010 | Local/CI/dev/staging zachowują logiczny parytet z produkcją GCP. |
| DEC-011 | MVP obejmuje całą aplikację; jedynym ograniczeniem są 7 integracji. |
| DEC-012 | AI działa lokalnie i przez wymienny adapter zewnętrznego LLM. |
| DEC-013 | NIP jest wyszukiwany przez backendowy adapter GUS/BIR z ręcznym fallbackiem. |
| DEC-014 | Mobile distribution jest owner-only; QR sklepów i parowania są oddzielne. |
| DEC-015 | Raporty są edytowalne, zachowują wizualizacje i eksportują PDF/CSV/XLSX. |
| DEC-016 | Papa Asystent i Laboratorium używają jednego conversationId. |
| DEC-017 | AI Cases obsługują anomalie, wzrosty, ryzyka i rekomendacje. |
| DEC-018 | AI Actions wymagają jawnej akceptacji człowieka, audytu i rollbacku/kompensacji. |
| DEC-019 | Billing MVP obejmuje cykle miesięczny/roczny, kartę, BLIK i przelewy. |
| DEC-020 | Faktury są integrowane z KSeF; pakiet prawny jest częścią gotowości go-live. |


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-08-slownik-pojec-i-nazewnictwa"></a>

## Słownik pojęć i nazewnictwa

| Termin | Znaczenie |
|---|---|
| tenant | kanoniczna granica izolacji klienta |
| organizacja | etykieta UI dla tenanta; nie tworzy osobnego organizationId |
| workspace / obszar roboczy | operacyjny kontekst wewnątrz tenanta |
| capability | backendowo potwierdzona możliwość wykonania operacji |
| entitlement | dostęp wynikający z planu lub umowy |
| readiness | gotowość danych do określonego użycia |
| provenance | źródła, zakres, świeżość i kompletność wyniku |
| evidence | dane i źródła wspierające wniosek AI lub analityczny |
| surface | powierzchnia z własną rolą, stanem lub cyklem interakcji |
| pattern | współdzielona kompozycja komponentów rozwiązująca powtarzalne zadanie |


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-09-mapa-domen-produktu"></a>

## Mapa domen produktu

| Moduł | ID | Właściciel |
| --- | --- | --- |
| Centrum Dowodzenia | M04 | Decision Intelligence |
| Kampanie płatne | M05 | Paid Media |
| Zamówienia | M06 | Commerce Operations |
| Produkty | M07 | Catalog & Merchandising |
| Klienci | M08 | Customer Intelligence |
| Ruch na stronie i lejek sprzedażowy | M09 | Web Analytics |
| Integracje i synchronizacja | M10 | Data Integrations |
| Jakość danych i integralność | M11 | Data Platform |
| Papa Asystent i Laboratorium AI | M12 | AI Platform |
| Ustawienia, zespół i bezpieczeństwo | M13 | Platform Administration |
| Subskrypcja i płatności | M14 | Billing |
| Wsparcie marketingowe, decyzje i działania | M15 | Decision Operations |
| Centrum Pomocy | M15 | Customer Support |


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-10-mapa-komponentow"></a>

## Mapa komponentów

Katalog zawiera 63 indywidualnych kontraktów.

| Komponent | Rodzina | Odpowiedzialność |
| --- | --- | --- |
| BrandMark | marka | Znak marki bez tekstu |
| BrandLockup | marka | Znak i nazwa PapaData |
| Button | akcje | Akcja tekstowa primary/secondary/ghost/danger |
| IconButton | akcje | Akcja ikonowa z nazwą dostępną |
| TextAction | akcje | Niskopriorytetowa akcja tekstowa |
| TextField | formularze | Jednoliniowe pole tekstowe |
| PasswordField | formularze | Pole hasła z widocznością i Caps Lock |
| NipField | formularze | Pole NIP z formatowaniem i walidacją |
| NumberField | formularze | Pole liczbowe z lokalizacją |
| SearchField | formularze | Pole wyszukiwania z czyszczeniem |
| TextArea | formularze | Tekst wielowierszowy |
| VerificationCodeInput | formularze | Kod jednorazowy |
| FileInput | formularze | Kontrolowany wybór pliku |
| Checkbox | wybor | Wielokrotny wybór lub zgoda |
| RadioGroup | wybor | Jedna opcja z krótkiej listy |
| Select | wybor | Jedna opcja z listy |
| Combobox | wybor | Wybór z wyszukiwaniem |
| Switch | wybor | Natychmiastowa zmiana ustawienia |
| DateRangePicker | wybor | Zakres dat i presety |
| InlineNotice | status | Komunikat w kontekście |
| StatusBadge | status | Kompaktowy status z tekstem |
| DataStatusBanner | status | Przekrojowy status gotowości danych |
| EmptyState | status | Brak zawartości z następną akcją |
| ErrorState | status | Błąd z klasyfikacją i odzyskaniem |
| Toast | status | Krótkie potwierdzenie operacji |
| Spinner | loading | Krótka operacja bez szkieletu |
| Skeleton | loading | Zachowanie geometrii podczas ładowania |
| ProgressIndicator | loading | Mierzalny postęp wieloetapowy |
| BackgroundOperationItem | loading | Asynchroniczny job |
| DataTable | data | Tabela danych z sortowaniem i stanami |
| ColumnPicker | data | Wybór kolumn |
| Pagination | data | Stronicowanie lub cursor |
| FilterBar | data | Filtry adresowalne |
| BulkActionBar | data | Akcje na zaznaczeniu |
| Tabs | navigation | Nawigacja między równorzędnymi widokami |
| SectionNavigation | navigation | Podsekcje modułu |
| Breadcrumbs | navigation | Ścieżka zagnieżdżonej treści |
| PaginationNav | navigation | Nawigacja paginacji |
| Menu | overlay | Lista akcji |
| Popover | overlay | Niemodalna powierzchnia zakotwiczona |
| Tooltip | overlay | Pomocniczy opis |
| Dialog | overlay | Modalna decyzja lub formularz |
| AlertDialog | overlay | Potwierdzenie ryzykownej akcji |
| Drawer | overlay | Panel szczegółów lub mobilny |
| BottomSheet | overlay | Mobilna warstwa zadaniowa |
| PageHeader | layout | Tytuł, opis i akcje strony |
| SectionIntro | layout | Nagłówek sekcji |
| Panel | layout | Powierzchnia z własnym cyklem interakcji |
| DetailPanel | layout | Szczegóły wskazanego obiektu |
| MetricCard | analytics | KPI z porównaniem i statusem danych |
| ChartFrame | analytics | Kontener wykresu z pytaniem, legendą i alternatywą |
| TrendChart | analytics | Trend w czasie |
| ComparisonChart | analytics | Porównanie kategorii |
| ShareChart | analytics | Struktura udziału |
| CorrelationChart | analytics | Relacja dwóch miar |
| ForecastChart | analytics | Actual, plan i prognoza |
| WaterfallChart | analytics | Składowe zmiany wyniku |
| FunnelChart | analytics | Konwersja etapów |
| EvidencePanel | ai | Dowody, źródła i ograniczenia |
| RecommendationCard | ai | Rekomendacja z wpływem i ryzykiem |
| DecisionCard | ai | Decyzja i jej status |
| ApprovalPanel | ai | Dokładna operacja wymagająca zatwierdzenia |
| AssistantComposer | ai | Pole rozmowy z kontekstem |

<a id="sekcja-11-mapa-ekranow"></a>

## Mapa ekranów

Pełna, maszynowo czytelna mapa: [ekrany.csv](../../../macierze/ekrany.csv).

| ID | Ekran | Dokument |
| --- | --- | --- |
| 30.01 | Widok główny | 07-centrum-dowodzenia/README.md |
| 30.02 | Kolejka uwagi | 07-centrum-dowodzenia/README.md |
| 30.03 | KPI | 07-centrum-dowodzenia/README.md |
| 30.04 | Plan vs wynik | 07-centrum-dowodzenia/README.md |
| 30.05 | Drivery wyniku | 07-centrum-dowodzenia/README.md |
| 30.06 | Źródła sprzedaży | 07-centrum-dowodzenia/README.md |
| 30.07 | Ruch | 07-centrum-dowodzenia/README.md |
| 30.08 | Produkty | 07-centrum-dowodzenia/README.md |
| 30.09 | Klienci | 07-centrum-dowodzenia/README.md |
| 30.10 | Lejek | 07-centrum-dowodzenia/README.md |
| 30.11 | Rekomendacje AI — skrót | 07-centrum-dowodzenia/README.md |
| 30.12 | Sygnały sprzedażowe | 07-centrum-dowodzenia/README.md |
| 30.13 | Waterfall | 07-centrum-dowodzenia/README.md |
| 30.14 | Warianty Centrum Dowodzenia | 07-centrum-dowodzenia/README.md |
| 31.01 | Przegląd | 08-kampanie-platne/README.md |
| 31.02 | Lista kampanii | 08-kampanie-platne/README.md |
| 31.03 | Szczegóły kampanii | 08-kampanie-platne/README.md |
| 31.04 | Atrybucja i sprzedaż | 08-kampanie-platne/README.md |
| 31.05 | Budżet | 08-kampanie-platne/README.md |
| 31.06 | Diagnostyka | 08-kampanie-platne/README.md |
| 31.07 | Rekomendacje — kontekst domenowy | 08-kampanie-platne/README.md |
| 31.08 | Warianty kampanii | 08-kampanie-platne/README.md |
| 32.01 | Przegląd | 09-zamowienia/README.md |
| 32.02 | Lista | 09-zamowienia/README.md |
| 32.03 | Szczegóły | 09-zamowienia/README.md |
| 32.04 | Oś zdarzeń | 09-zamowienia/README.md |
| 32.05 | Porównanie źródeł | 09-zamowienia/README.md |
| 32.06 | Rekoncyliacja — skrót | 09-zamowienia/README.md |
| 32.07 | Eksport | 09-zamowienia/README.md |
| 32.08 | Warianty zamówień | 09-zamowienia/README.md |
| 33.01 | Przegląd | 10-produkty/README.md |
| 33.02 | Katalog | 10-produkty/README.md |
| 33.03 | Szczegóły | 10-produkty/README.md |
| 33.04 | Mapowanie | 10-produkty/README.md |
| 33.05 | Oferty | 10-produkty/README.md |
| 33.06 | Wydajność | 10-produkty/README.md |
| 33.07 | Kolejka braków | 10-produkty/README.md |
| 33.08 | Analiza wpływu | 10-produkty/README.md |
| 33.09 | Warianty produktów | 10-produkty/README.md |
| 34.01 | Przegląd | 11-klienci/README.md |
| 34.02 | Segmenty | 11-klienci/README.md |
| 34.03 | Kohorty | 11-klienci/README.md |
| 34.04 | Szczegóły pseudonimizowane | 11-klienci/README.md |
| 34.05 | Konflikty tożsamości | 11-klienci/README.md |
| 34.06 | Prywatność | 11-klienci/README.md |
| 34.07 | Analiza wpływu | 11-klienci/README.md |
| 34.08 | Warianty klientów | 11-klienci/README.md |
| 35.01 | Przegląd ruchu | 12-ruch-i-lejek/README.md |
| 35.02 | Kanały | 12-ruch-i-lejek/README.md |
| 35.03 | Lejek — widok | 12-ruch-i-lejek/README.md |
| 35.04 | Lejek — szczegóły kroku | 12-ruch-i-lejek/README.md |
| 35.05 | Definicje lejka | 12-ruch-i-lejek/README.md |
| 35.06 | GA4 vs zamówienia | 12-ruch-i-lejek/README.md |
| 35.07 | Jakość zdarzeń | 12-ruch-i-lejek/README.md |
| 35.08 | Strony wejścia | 12-ruch-i-lejek/README.md |
| 35.09 | Warianty ruchu | 12-ruch-i-lejek/README.md |
| 40.01 | Katalog integracji | 13-integracje-i-synchronizacja/README.md |
| 40.02 | Kreator połączenia | 13-integracje-i-synchronizacja/README.md |
| 40.03 | Szczegóły integracji | 13-integracje-i-synchronizacja/README.md |
| 40.04 | Historia synchronizacji | 13-integracje-i-synchronizacja/README.md |
| 40.05 | Przebieg synchronizacji | 13-integracje-i-synchronizacja/README.md |
| 40.06 | Zakres synchronizacji | 13-integracje-i-synchronizacja/README.md |
| 40.07 | Ponowne połączenie | 13-integracje-i-synchronizacja/README.md |
| 40.08 | Odłączenie | 13-integracje-i-synchronizacja/README.md |
| 40.09 | Awaria providera | 13-integracje-i-synchronizacja/README.md |
| 40.10 | Warianty integracji | 13-integracje-i-synchronizacja/README.md |
| 41.01 | Centrum jakości | 14-jakosc-danych-i-integralnosc/README.md |
| 41.02 | Zbiór danych | 14-jakosc-danych-i-integralnosc/README.md |
| 41.03 | Pochodzenie danych | 14-jakosc-danych-i-integralnosc/README.md |
| 41.04 | Nakładanie źródeł | 14-jakosc-danych-i-integralnosc/README.md |
| 41.05 | Nadrzędność źródła | 14-jakosc-danych-i-integralnosc/README.md |
| 41.06 | Konflikty | 14-jakosc-danych-i-integralnosc/README.md |
| 41.07 | Przegląd ręczny | 14-jakosc-danych-i-integralnosc/README.md |
| 41.08 | Ponowne przetwarzanie | 14-jakosc-danych-i-integralnosc/README.md |
| 41.09 | Rekoncyliacja | 14-jakosc-danych-i-integralnosc/README.md |
| 41.10 | Warianty jakości danych | 14-jakosc-danych-i-integralnosc/README.md |
| 50.01 | Panel kontekstowy Papa | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.02 | AssistantShell | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.03 | Tryby pracy | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.04 | Context basket | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.05 | Odpowiedź Papa | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.06 | Dowody | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.07 | Confidence | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.08 | Laboratorium AI | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.09 | Obserwacje | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.10 | Rekomendacje i warianty | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.11 | Propozycje AI | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.12 | AI Action Approval | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.13 | AI Actions | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.14 | Zablokowane działania AI | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.15 | Historia i pamięć Papa | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.16 | Ustawienia AI i Governance | 15-papa-asystent-i-laboratorium-ai/README.md |
| 50.17 | Warianty Papa | 15-papa-asystent-i-laboratorium-ai/README.md |
| 60.01 | Organizacja | 16-ustawienia-zespol-bezpieczenstwo/README.md |
| 60.02 | Workspace | 16-ustawienia-zespol-bezpieczenstwo/README.md |
| 60.03 | Członkostwa | 16-ustawienia-zespol-bezpieczenstwo/README.md |
| 60.04 | Role i uprawnienia | 16-ustawienia-zespol-bezpieczenstwo/README.md |
| 60.05 | Bezpieczeństwo konta | 16-ustawienia-zespol-bezpieczenstwo/README.md |
| 60.06 | Sesje | 16-ustawienia-zespol-bezpieczenstwo/README.md |
| 60.07 | Audyt | 16-ustawienia-zespol-bezpieczenstwo/README.md |
| 60.08 | Prywatność | 16-ustawienia-zespol-bezpieczenstwo/README.md |
| 60.09 | Dostęp wsparcia | 16-ustawienia-zespol-bezpieczenstwo/README.md |
| 60.10 | Warianty ustawień | 16-ustawienia-zespol-bezpieczenstwo/README.md |
| 70.01 | Subskrypcja | 17-subskrypcja-i-platnosci/README.md |
| 70.02 | Użycie i limity | 17-subskrypcja-i-platnosci/README.md |
| 70.03 | Plany | 17-subskrypcja-i-platnosci/README.md |
| 70.04 | Faktury | 17-subskrypcja-i-platnosci/README.md |
| 70.05 | Płatności | 17-subskrypcja-i-platnosci/README.md |
| 70.06 | Zaległa płatność | 17-subskrypcja-i-platnosci/README.md |
| 70.07 | Korekty | 17-subskrypcja-i-platnosci/README.md |
| 70.08 | Zmiana i anulowanie | 17-subskrypcja-i-platnosci/README.md |
| 70.09 | Pilot do abonamentu | 17-subskrypcja-i-platnosci/README.md |
| 70.10 | Warianty billingowe | 17-subskrypcja-i-platnosci/README.md |
| 80.01 | Centrum decyzji | 18-wsparcie-marketingowe-decyzje-dzialania/README.md |
| 80.02 | Obserwacje | 18-wsparcie-marketingowe-decyzje-dzialania/README.md |
| 80.03 | Rekomendacje | 18-wsparcie-marketingowe-decyzje-dzialania/README.md |
| 80.04 | Rejestr decyzji | 18-wsparcie-marketingowe-decyzje-dzialania/README.md |
| 80.05 | Brief działania | 18-wsparcie-marketingowe-decyzje-dzialania/README.md |
| 80.06 | Szczegóły działania | 18-wsparcie-marketingowe-decyzje-dzialania/README.md |
| 80.07 | Pomiar | 18-wsparcie-marketingowe-decyzje-dzialania/README.md |
| 80.08 | Biblioteka działań | 18-wsparcie-marketingowe-decyzje-dzialania/README.md |
| 80.09 | Powiązania z modułami i sprawami | 18-wsparcie-marketingowe-decyzje-dzialania/README.md |
| 80.10 | Warianty decyzji i działań | 18-wsparcie-marketingowe-decyzje-dzialania/README.md |
| 85.01 | Strona główna pomocy | 19-centrum-pomocy/README.md |
| 85.02 | Procedury | 19-centrum-pomocy/README.md |
| 85.03 | Lista wyników | 19-centrum-pomocy/README.md |
| 85.04 | Szczegóły procedury | 19-centrum-pomocy/README.md |
| 85.05 | Zgłoszenie wsparcia | 19-centrum-pomocy/README.md |
| 85.06 | Warianty Centrum Pomocy | 19-centrum-pomocy/README.md |

<a id="sekcja-12-mapa-przeplywow"></a>

## Mapa przepływów

| ID | Nazwa | Dokument |
| --- | --- | --- |
| 90.01 | Zaproszenie do pierwszego KPI | 20-przeplywy-e2e/01-06-access-i-dane.md |
| 90.02 | Onboarding do pierwszej wartości | 20-przeplywy-e2e/01-06-access-i-dane.md |
| 90.03 | Zmiana workspace | 20-przeplywy-e2e/01-06-access-i-dane.md |
| 90.04 | KPI do rekordu źródłowego | 20-przeplywy-e2e/01-06-access-i-dane.md |
| 90.05 | Połączenie do pierwszych danych | 20-przeplywy-e2e/01-06-access-i-dane.md |
| 90.06 | Wygasły token do ponownego połączenia | 20-przeplywy-e2e/01-06-access-i-dane.md |
| 90.07 | Problem danych do readiness | 20-przeplywy-e2e/07-12-jakosc-i-wzrost.md |
| 90.08 | Produkt do ponownego przetwarzania | 20-przeplywy-e2e/07-12-jakosc-i-wzrost.md |
| 90.09 | Uwaga do decyzji | 20-przeplywy-e2e/07-12-jakosc-i-wzrost.md |
| 90.10 | Kampania do decyzji budżetowej | 20-przeplywy-e2e/07-12-jakosc-i-wzrost.md |
| 90.11 | Segment do decyzji | 20-przeplywy-e2e/07-12-jakosc-i-wzrost.md |
| 90.12 | Spadek ruchu do działania | 20-przeplywy-e2e/07-12-jakosc-i-wzrost.md |
| 90.13 | Obserwacja do wyniku | 20-przeplywy-e2e/13-18-ai-decyzje-billing.md |
| 90.14 | KPI do interpretacji Papa | 20-przeplywy-e2e/13-18-ai-decyzje-billing.md |
| 90.15 | Rekomendacja do decyzji | 20-przeplywy-e2e/13-18-ai-decyzje-billing.md |
| 90.16 | AI Action: approval, wykonanie i wynik | 20-przeplywy-e2e/90-16-ai-action-approval-wykonanie-i-wynik.md |
| 90.17 | Pilot do abonamentu | 20-przeplywy-e2e/13-18-ai-decyzje-billing.md |
| 90.18 | Zaległa płatność do odzyskania dostępu | 20-przeplywy-e2e/90-18-zalegla-platnosc-do-odzyskania-dostepu.md |

<a id="sekcja-13-macierz-ekran-komponent"></a>

## Macierz ekran–komponent

Wpis „required” oznacza obowiązkowy zakres implementacji.
### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-14-macierz-ekran-dane-api"></a>

## Macierz ekran–dane–API

Źródło: [CSV](../../../macierze/ekran-dane-api.csv). Operation ID jest stabilnym kluczem śledzalności; ścieżki HTTP są własnością kontraktów domenowych.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-15-macierz-ekran-rola-uprawnienie"></a>

## Macierz ekran–rola–uprawnienie

Źródło: [CSV](../../../macierze/ekran-rola-uprawnienie.csv). Role są prezentacją administracyjną; backend egzekwuje capabilities.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-16-macierz-ekran-storybook-test"></a>

## Macierz ekran–Storybook–test

Źródło: [CSV](../../../macierze/ekran-storybook-test.csv). Status planowany nie może zostać zmieniony na wdrożony bez istnienia pliku i przejścia testu.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-25-rozdzielenie-route-api-story-event"></a>

## Rozdzielenie route, API, Storybook i eventów 1.0

| Pojęcie | Właściciel kontraktu | Rejestr |
| --- | --- | --- |
| route ekranu | dokument routowalnej powierzchni i router aplikacji | `rejestry/routes.csv` |
| operation ID | kontrakt domenowy/API | `rejestry/api-operations.csv` |
| story title | katalog Storybooka | `rejestry/storybook.csv` |
| event telemetryczny | kontrakt analityki produktu | `rejestry/events.csv` |
| capability | backend authorization/access matrix | `rejestry/capabilities.csv` |

Zakazane są endpointy `/storybook/*`, endpointy `/flows/*`, route’y dla komponentów oraz uznawanie story title za adres runtime.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-26-reguly-component-before-screen"></a>

## Reguły component-before-screen 1.0

Ekran może zostać zaakceptowany dopiero, gdy każdy element w jego anatomii ma kontrakt komponentu bazowego, analitycznego lub domenowego. W 1.0 dodano brakującą sekcję `04-komponenty-domenowe` i powiązano ją z ekranami Centrum Dowodzenia, kampanii, klientów, lejka, synchronizacji, jakości danych oraz mobile.

### Wymagana relacja

`fundament → komponent bazowy → komponent domenowy/wzorzec → ekran → przepływ E2E`

### Brama

- ekran nie definiuje lokalnej tabeli, KPI, statusu, dialogu ani wykresu;
- komponent domenowy ma model widoku, zdarzenia, stany, Storybook i testy;
- relacja znajduje się w `macierze/ekran-komponent.csv` lub `rejestry/component-screen.csv`;
- brak komponentu albo brak statusu `accepted` w runtime API/Storybooku blokuje implementację ekranu produkcyjnego;
- ekran może przejść z backlogu do runtime dopiero, gdy wszystkie wymagane komponenty mają zaakceptowany kontrakt, fixture, story i test wymagany przez `rejestry/storybook.csv`.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-27-rejestr-route-i-nawigacji"></a>

## Rejestr route i nawigacji 1.0

Kanoniczny rejestr maszynowy: [`routes.csv`](../../../rejestry/routes.csv).

### Reguły

- jeden właściciel kanoniczny route;
- katalog, mapa i przepływ mogą odwoływać się do route, lecz nie są jego właścicielem;
- tenant/workspace nie są pobierane z dowolnego parametru klienta;
- filtry odtwarzalne są synchronizowane z URL;
- komponenty, overlaye i fundamenty nie otrzymują samodzielnego route.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-28-rejestr-operacji-api"></a>

## Rejestr operacji domenowych i API 1.0

Kanoniczny wykaz użyć operation ID znajduje się w [`api-operations.csv`](../../../rejestry/api-operations.csv). Dokładne metody i ścieżki HTTP są własnością 17 dokumentów w `25-kontrakty-domenowe-i-api` oraz przyszłego OpenAPI zaakceptowanego dla konkretnego SHA.

Każdy command wymaga capability, audytu, correlation ID, idempotency key i — jeśli aktualizuje wersjonowany rekord — `expectedVersion`.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-29-rejestr-eventow-telemetrii"></a>

## Rejestr eventów i telemetrii 1.0

Maszynowy wykaz: [`events.csv`](../../../rejestry/events.csv).

Event opisuje intencję i rezultat, nie pełne dane ekranu. Zakazane są hasła, tokeny, NIP, e-mail, PII klienta, pełny prompt, pełny eksport i surowe wartości biznesowe, jeżeli wystarczy identyfikator referencyjny lub klasyfikacja.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-30-rejestr-capabilities-i-rol"></a>

## Rejestr capabilities i ról 1.0

Maszynowy wykaz: [`capabilities.csv`](../../../rejestry/capabilities.csv).

Role są zestawami capabilities, nie źródłem decyzji bezpieczeństwa w UI. Backend oblicza effective access dla aktywnego tenanta i workspace. Każda akcja ukryta lub zablokowana ma dostępne wyjaśnienie bez ujawniania polityk bezpieczeństwa.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-31-slownik-danych-i-klasyfikacji"></a>

## Słownik danych i klasyfikacji 1.0

Maszynowy indeks encji: [`entities.csv`](../../../rejestry/entities.csv).

### Klasyfikacje

| Klasa | Przykłady | Zasada |
| --- | --- | --- |
| PUBLIC | publiczne treści pomocy | może być cache’owane publicznie po akceptacji |
| INTERNAL | konfiguracja produktu, niepoufne metadane | dostęp tylko dla uwierzytelnionych ról |
| CONFIDENTIAL | KPI, kampanie, budżety, marża, zamówienia | tenant/workspace isolation, audyt eksportu |
| RESTRICTED | PII, tokeny, sekrety, recovery codes | minimalizacja, maskowanie, szyfrowanie, brak logowania |

Każdy odczyt analityczny ma `readiness`, `asOf`, `period`, `sources`, `definitionVersion` i `limitations`. Każda wartość finansowa ma walutę i regułę porównywalności.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-33-brama-akceptacyjna"></a>

## Brama akceptacyjna 1.0

| Kontrola | Próg |
| --- | ---: |
| broken local links | 0 |
| exact normalized duplicates | 0 |
| unresolved markers | 0 |
| pseudo endpoint `/storybook` lub `/flows` | 0 |
| katalogi Auth | 10 |
| powierzchnie Auth | 29 |
| dokumenty Centrum Dowodzenia | 14 |
| przepływy E2E | 18 |
| komponenty domenowe | co najmniej 18 |
| dokumenty security PL + plan źródłowy | co najmniej 19 + pełne źródła |
| dokumenty mobile PL + OpenAPI/Prisma/backlog | co najmniej 14 + pełne źródła |
| kontrakty domenowe/API | co najmniej 17 |
| mapy i indeksy | co najmniej 5 |
| dokumenty bez H1 | 0 |
| źródła wejściowe bez SHA-256 | 0 |

Status PASS oznacza zgodność strukturalną kontraktu, nie wdrożenie produktu.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-39-raport-zaleznosci-i-licencji"></a>

## 39. Raport zależności i licencji

Data audytu: 2026-07-30
Branch: `docs/docelowa-dokumentacja-1-0`
Zakres: bezpośrednie zależności z `package.json` w root oraz `apps/web/package.json`, z weryfikacją wersji i pól `license` na podstawie `pnpm-lock.yaml` oraz zainstalowanych manifestów w `node_modules`.

### Decyzje bazowe

- Nie instalujemy teraz nowych bibliotek.
- Obecne zależności na licencjach `MIT` i `Apache-2.0` są zaakceptowane.
- `@fontsource/inter` i `@fontsource/jetbrains-mono` na `OFL-1.1` są dopuszczone, ale wymagają świadomej akceptacji licencji fontowej.
- Każda nowa biblioteka wymaga osobnej decyzji przed instalacją.

### Package manager i lockfile

- Package manager: `pnpm@10.29.3`
- Lockfile: `pnpm-lock.yaml`
- `lockfileVersion`: `9.0`
- `node_modules`: istnieje
- `engines.node`: `24.18.0`
- Lokalny `node -v`: `v24.18.0`
- Zgodność lokalnego Node z `engines.node`: zgodna
- Komenda instalacji awaryjnej, gdyby trzeba było odtworzyć środowisko: `pnpm install --frozen-lockfile`

### Liczba zależności

| Manifest | dependencies | devDependencies |
| --- | ---: | ---: |
| `package.json` | 0 | 2 |
| `apps/web/package.json` | 4 | 10 |
| Suma wpisów | 4 | 12 |

Uwagi:
- Liczba unikalnych pakietów w audytowanym zakresie: 15.
- `typescript` występuje w root i w `apps/web`.

### Tabela bibliotek runtime

| Pakiet | Manifest | Specyfikator | Wersja zainstalowana | Licencja | Status | Uwagi |
| --- | --- | --- | --- | --- | --- | --- |
| `@fontsource/inter` | `apps/web/package.json` | `^5.3.0` | `5.3.0` | `OFL-1.1` | wymaga weryfikacji | Licencja fontowa, nie copyleft, ale ma odrębne warunki dla fontów i ich dystrybucji. |
| `@fontsource/jetbrains-mono` | `apps/web/package.json` | `^5.3.0` | `5.3.0` | `OFL-1.1` | wymaga weryfikacji | Jak wyżej; dotyczy osadzenia i redystrybucji plików fontów. |
| `react` | `apps/web/package.json` | `^19.2.8` | `19.2.8` | `MIT` | OK | Standardowa licencja permisywna. |
| `react-dom` | `apps/web/package.json` | `^19.2.8` | `19.2.8` | `MIT` | OK | Standardowa licencja permisywna. |

### Tabela bibliotek dev

| Pakiet | Manifest | Specyfikator | Wersja zainstalowana | Licencja | Status | Uwagi |
| --- | --- | --- | --- | --- | --- | --- |
| `turbo` | `package.json` | `2.10.5` | `2.10.5` | `MIT` | OK | Narzędzie build orchestration. |
| `typescript` | `package.json` | `~6.0.3` | `6.0.3` | `Apache-2.0` | OK | Licencja permisywna. |
| `@storybook/addon-a11y` | `apps/web/package.json` | `^10.5.3` | `10.5.3` | `MIT` | OK | Open-source addon Storybook. |
| `@storybook/addon-docs` | `apps/web/package.json` | `^10.5.3` | `10.5.3` | `MIT` | OK | Open-source addon Storybook. |
| `@storybook/react-vite` | `apps/web/package.json` | `^10.5.3` | `10.5.3` | `MIT` | OK | Open-source integracja Storybook + React + Vite. |
| `@types/node` | `apps/web/package.json` | `^24.13.3` | `24.13.3` | `MIT` | OK | Typy DefinitelyTyped. |
| `@types/react` | `apps/web/package.json` | `^19.2.17` | `19.2.17` | `MIT` | OK | Typy DefinitelyTyped. |
| `@types/react-dom` | `apps/web/package.json` | `^19.2.3` | `19.2.3` | `MIT` | OK | Typy DefinitelyTyped. |
| `@vitejs/plugin-react` | `apps/web/package.json` | `^6.0.4` | `6.0.4` | `MIT` | OK | Plugin Vite dla React. |
| `storybook` | `apps/web/package.json` | `^10.5.3` | `10.5.3` | `MIT` | OK | Open-source core Storybook. |
| `typescript` | `apps/web/package.json` | `~6.0.3` | `6.0.3` | `Apache-2.0` | OK | Ten sam pakiet co w root. |
| `vite` | `apps/web/package.json` | `^8.1.5` | `8.1.5` | `MIT` | OK | Narzędzie build/dev server. |

### Licencje

Bezpośrednie pakiety w audytowanym zakresie korzystają z następujących licencji:

| Licencja | Pakiety |
| --- | --- |
| `MIT` | `react`, `react-dom`, `turbo`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `@storybook/react-vite`, `@types/node`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react`, `storybook`, `vite` |
| `Apache-2.0` | `typescript` |
| `OFL-1.1` | `@fontsource/inter`, `@fontsource/jetbrains-mono` |

### Wynik skanu ryzyk licencyjnych

- Nie wykryto bezpośrednich pakietów na licencjach `GPL`, `AGPL`, `LGPL`, `SSPL` ani `BUSL`.
- Nie wykryto pakietów oznaczonych jako `enterprise`, `commercial` albo `trial` w audytowanym zakresie bezpośrednich zależności.
- Dodatkowy skan zainstalowanego drzewa `pnpm` wykrył `0` pakietów z licencjami `GPL/AGPL/LGPL/SSPL/BUSL` wśród `686` unikalnych zainstalowanych pakietów.
- Dodatkowy skan zainstalowanego drzewa `pnpm` nie wykrył słów kluczowych `enterprise/commercial/trial` w polach `name`, `description`, `license`, `homepage` dla tych samych `686` pakietów.

### Ryzyka

- `@fontsource/inter` oraz `@fontsource/jetbrains-mono` są na licencji `OFL-1.1`, czyli nie są problemem copyleft, ale wymagają świadomej akceptacji zasad licencji fontowej.
- Audyt tabelaryczny obejmuje bezpośrednie zależności z root i `apps/web`. Przy dodawaniu nowych pakietów trzeba wykonywać ten sam przegląd dla pakietu i jego licencji przed instalacją.
- Skan słów kluczowych `enterprise/commercial/trial` ma charakter pomocniczy. Brak trafień nie jest formalną opinią prawną; oznacza tylko brak oczywistych sygnałów w metadanych npm.

### Rekomendacje

- Zostawić obecne pakiety na `MIT` i `Apache-2.0`: `react`, `react-dom`, `turbo`, `typescript`, pakiety `storybook`, pakiety `@types/*`, `@vitejs/plugin-react`, `vite`.
- Zostawić `@fontsource/inter` i `@fontsource/jetbrains-mono` tylko pod warunkiem akceptacji licencji `OFL-1.1` dla fontów samohostowanych.
- Nie dodawać nowych pakietów na licencjach `GPL`, `AGPL`, `LGPL`, `SSPL`, `BUSL`, `Elastic-2.0`, `Commons Clause`, `Polyform`, ani pakietów z `commercial`, `enterprise`, `trial` lub `EULA/custom license`, bez osobnej decyzji.
- Dla każdej nowej biblioteki wymagać przed instalacją: nazwy pakietu, wersji, licencji, linku do repozytorium oraz krótkiej noty o modelu komercyjnym.
- Jeżeli środowisko trzeba będzie odtworzyć, używać `pnpm install --frozen-lockfile`, żeby nie przesunąć wersji poza aktualny lockfile.

### Lista bibliotek, których nie wolno instalować bez decyzji

Aktualnie w audytowanym zakresie nie ma bezpośrednich pakietów oznaczonych jako `blokada do decyzji`.

Bez osobnej decyzji nie wolno instalować żadnych nowych pakietów, jeżeli:

- ich licencja to `GPL`, `AGPL`, `LGPL`, `SSPL`, `BUSL` albo inna licencja copyleft lub source-available z ograniczeniami dystrybucji;
- są oznaczone jako `commercial`, `enterprise`, `trial`, `EULA`, `custom license`;
- nie mają jednoznacznego pola `license`;
- dotyczą fontów lub assetów z odrębną licencją, jeżeli nie została zaakceptowana polityka ich dystrybucji.

### Konkluzja

Stan na 2026-07-30:

- `pnpm` i `pnpm-lock.yaml` są obecne i spójne z repo.
- `node_modules` istnieje, więc instalacja nie jest teraz wymagana.
- W audytowanych bezpośrednich zależnościach nie ma pakietów `GPL/AGPL/LGPL/SSPL/BUSL`.
- Jedyny obszar wymagający dodatkowej decyzji operacyjnej to pakiety fontowe na `OFL-1.1`.
