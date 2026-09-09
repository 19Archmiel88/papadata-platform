---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Mapy i indeksy

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-99-01-mapowanie-specyfikacji-m01-m15"></a>

## Mapowanie specyfikacji M01–M15

| Moduł | Nazwa | Sekcja |
| --- | --- | --- |
| M02 | Fundamenty | 01-fundamenty |
| M02 | Tła i powierzchnie | 02-tla-i-powierzchnie |
| M01 | Dostęp, rejestracja i onboarding | 03-dostep-rejestracja-onboarding |
| M02 | Komponenty bazowe | 04-komponenty-bazowe |
| M02 | Wykresy i wizualizacje danych | 05-wykresy-i-wizualizacje |
| M03 | Powłoka produktu i nawigacja | 06-powloka-produktu-i-nawigacja |
| M04 | Centrum Dowodzenia | 07-centrum-dowodzenia |
| M05 | Kampanie płatne | 08-kampanie-platne |
| M06 | Zamówienia | 09-zamowienia |
| M07 | Produkty | 10-produkty |
| M08 | Klienci | 11-klienci |
| M09 | Ruch na stronie i lejek sprzedażowy | 12-ruch-i-lejek |
| M10 | Integracje i synchronizacja | 13-integracje-i-synchronizacja |
| M11 | Jakość danych i integralność | 14-jakosc-danych-i-integralnosc |
| M12 | Papa Asystent i Laboratorium AI | 15-papa-asystent-i-laboratorium-ai |
| M13 | Ustawienia, zespół i bezpieczeństwo | 16-ustawienia-zespol-bezpieczenstwo |
| M14 | Subskrypcja i płatności | 17-subskrypcja-i-platnosci |
| M15 | Wsparcie marketingowe, decyzje i działania | 18-wsparcie-marketingowe-decyzje-dzialania |
| M15 | Centrum Pomocy | 19-centrum-pomocy |
| M02/M03 | Stany i wzorce przekrojowe | 21-stany-przekrojowe |
| MOBILE | Aplikacja mobilna | 24-aplikacja-mobilna |

<a id="sekcja-99-02-mapa-sidebara"></a>

## Mapa sidebara

| Grupa | Pozycja | Dostęp |
|---|---|---|
| Analiza | Centrum Dowodzenia | command-center.read |
| Analiza | Kampanie płatne | campaigns.read |
| Analiza | Zamówienia | orders.read |
| Analiza | Produkty | products.read |
| Analiza | Klienci | customers.read |
| Analiza | Ruch na stronie | traffic.read |
| AI | Laboratorium Papa Asystenta | ai.use |
| Dane i integracje | Integracje | integrations.read |
| Dane i integracje | Jakość danych | data-quality.read; bezpośrednia dla Data Steward, kontekstowa dla innych |
| Administracja | Ustawienia | settings.read |
| Administracja | Subskrypcja i płatności | billing.read |
| Wsparcie | Wsparcie w marketingu | decisions.read |
| Wsparcie | Centrum Pomocy | help.read |


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-99-03-mapa-przeplywow"></a>

## Mapa przepływów

Pełna mapa: [przeplywy.csv](../../../macierze/przeplywy.csv).


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-99-04-indeks-komponentow"></a>

## Indeks komponentów

| Komponent | Rodzina | Dokument |
| --- | --- | --- |
| BrandMark | marka | ../04-komponenty-bazowe/komponenty/brandmark.md |
| BrandLockup | marka | ../04-komponenty-bazowe/komponenty/brandlockup.md |
| Button | akcje | ../04-komponenty-bazowe/komponenty/button.md |
| IconButton | akcje | ../04-komponenty-bazowe/komponenty/iconbutton.md |
| TextAction | akcje | ../04-komponenty-bazowe/komponenty/textaction.md |
| TextField | formularze | ../04-komponenty-bazowe/komponenty/textfield.md |
| PasswordField | formularze | ../04-komponenty-bazowe/komponenty/passwordfield.md |
| NipField | formularze | ../04-komponenty-bazowe/komponenty/nipfield.md |
| NumberField | formularze | ../04-komponenty-bazowe/komponenty/numberfield.md |
| SearchField | formularze | ../04-komponenty-bazowe/komponenty/searchfield.md |
| TextArea | formularze | ../04-komponenty-bazowe/komponenty/textarea.md |
| VerificationCodeInput | formularze | ../04-komponenty-bazowe/komponenty/verificationcodeinput.md |
| FileInput | formularze | ../04-komponenty-bazowe/komponenty/fileinput.md |
| Checkbox | wybor | ../04-komponenty-bazowe/komponenty/checkbox.md |
| RadioGroup | wybor | ../04-komponenty-bazowe/komponenty/radiogroup.md |
| Select | wybor | ../04-komponenty-bazowe/komponenty/select.md |
| Combobox | wybor | ../04-komponenty-bazowe/komponenty/combobox.md |
| Switch | wybor | ../04-komponenty-bazowe/komponenty/switch.md |
| DateRangePicker | wybor | ../04-komponenty-bazowe/komponenty/daterangepicker.md |
| InlineNotice | status | ../04-komponenty-bazowe/komponenty/inlinenotice.md |
| StatusBadge | status | ../04-komponenty-bazowe/komponenty/statusbadge.md |
| DataStatusBanner | status | ../04-komponenty-domenowe/data-status-banner.md |
| EmptyState | status | ../04-komponenty-bazowe/komponenty/emptystate.md |
| ErrorState | status | ../04-komponenty-bazowe/komponenty/errorstate.md |
| Toast | status | ../04-komponenty-bazowe/komponenty/toast.md |
| Spinner | loading | ../04-komponenty-bazowe/komponenty/spinner.md |
| Skeleton | loading | ../04-komponenty-bazowe/komponenty/skeleton.md |
| ProgressIndicator | loading | ../04-komponenty-bazowe/komponenty/progressindicator.md |
| BackgroundOperationItem | loading | ../04-komponenty-bazowe/komponenty/backgroundoperationitem.md |
| DataTable | data | ../04-komponenty-bazowe/komponenty/datatable.md |
| ColumnPicker | data | ../04-komponenty-bazowe/komponenty/columnpicker.md |
| Pagination | data | ../04-komponenty-bazowe/komponenty/pagination.md |
| FilterBar | data | ../04-komponenty-bazowe/komponenty/filterbar.md |
| BulkActionBar | data | ../04-komponenty-bazowe/komponenty/bulkactionbar.md |
| Tabs | navigation | ../04-komponenty-bazowe/komponenty/tabs.md |
| SectionNavigation | navigation | ../04-komponenty-bazowe/komponenty/sectionnavigation.md |
| Breadcrumbs | navigation | ../04-komponenty-bazowe/komponenty/breadcrumbs.md |
| PaginationNav | navigation | ../04-komponenty-bazowe/komponenty/paginationnav.md |
| Menu | overlay | ../04-komponenty-bazowe/komponenty/menu.md |
| Popover | overlay | ../04-komponenty-bazowe/komponenty/popover.md |
| Tooltip | overlay | ../04-komponenty-bazowe/komponenty/tooltip.md |
| Dialog | overlay | ../04-komponenty-bazowe/komponenty/dialog.md |
| AlertDialog | overlay | ../04-komponenty-bazowe/komponenty/alertdialog.md |
| Drawer | overlay | ../04-komponenty-bazowe/komponenty/drawer.md |
| BottomSheet | overlay | ../04-komponenty-bazowe/komponenty/bottomsheet.md |
| PageHeader | layout | ../04-komponenty-bazowe/komponenty/pageheader.md |
| SectionIntro | layout | ../04-komponenty-bazowe/komponenty/sectionintro.md |
| Panel | layout | ../04-komponenty-bazowe/komponenty/panel.md |
| DetailPanel | layout | ../04-komponenty-bazowe/komponenty/detailpanel.md |
| MetricCard | analytics | ../05-wykresy-i-wizualizacje/komponenty/metriccard.md |
| ChartFrame | analytics | ../05-wykresy-i-wizualizacje/komponenty/chartframe.md |
| TrendChart | analytics | ../05-wykresy-i-wizualizacje/komponenty/trendchart.md |
| ComparisonChart | analytics | ../05-wykresy-i-wizualizacje/komponenty/comparisonchart.md |
| ShareChart | analytics | ../05-wykresy-i-wizualizacje/komponenty/sharechart.md |
| CorrelationChart | analytics | ../05-wykresy-i-wizualizacje/komponenty/correlationchart.md |
| ForecastChart | analytics | ../05-wykresy-i-wizualizacje/komponenty/forecastchart.md |
| WaterfallChart | analytics | ../05-wykresy-i-wizualizacje/komponenty/waterfallchart.md |
| FunnelChart | analytics | ../05-wykresy-i-wizualizacje/komponenty/funnelchart.md |
| EvidencePanel | ai | ../04-komponenty-domenowe/evidence-panel.md |
| RecommendationCard | ai | ../04-komponenty-domenowe/recommendation-card.md |
| DecisionCard | ai | ../04-komponenty-bazowe/komponenty/decisioncard.md |
| ApprovalPanel | ai | ../04-komponenty-bazowe/komponenty/approvalpanel.md |
| AssistantComposer | ai | ../04-komponenty-bazowe/komponenty/assistantcomposer.md |

<a id="sekcja-99-05-indeks-wzorcow"></a>

## Indeks wzorców

Wzorce przekrojowe znajdują się w `21-stany-przekrojowe`; wizualizacje w `05-wykresy-i-wizualizacje`; powłoka w `06-powloka-produktu-i-nawigacja`. Każdy wzorzec ma stany, responsywność, a11y, Storybook i kryteria odbioru.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-99-06-indeks-stanow"></a>

## Indeks stanów

Stany wspólne: loading, ready, empty, noData, partial, stale, processing, success, warning, recoverableError, terminalError, offline, permissionDenied, readOnly, rateLimited, planRestricted i sessionExpired. Domeny mogą dodać stan tylko z jednoznaczną semantyką i mapowaniem testów.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-99-07-status-akceptacji-sekcji"></a>

## Status akceptacji sekcji

Dokumentacja: kompletna strukturalnie po przejściu validatora. Implementacja: większość kontraktów wymaga wdrożenia. Status nie może być masowo zmieniony na „wdrożone”; wymaga dowodu per komponent, ekran, operation ID, story i test.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.

<a id="sekcja-mapa-panelu-bocznego-docelowa"></a>

## Mapa panelu bocznego — model docelowy

Sidebar grupuje analizę, AI, dane/integracje, administrację i wsparcie. Kolejność wynika z częstotliwości zadania. Badge błędu lub rekomendacji ma tekstowy odpowiednik; brak capability ukrywa lub blokuje pozycję zgodnie z polityką, ale backend nadal egzekwuje dostęp. Mobile używa draweru z focus trap i zamknięciem po wyborze route.


### Utrzymanie dokumentu 1.0

Ten dokument nie jest placeholderem. Pełni funkcję kontrolną w dokumentacji PapaData 1.0 i wskazuje, gdzie znajduje się źródło danych, kto odpowiada za interpretację oraz jakie reguły blokują zmianę bez aktualizacji powiązanych rejestrów. Każda zmiana treści tego dokumentu wymaga sprawdzenia spójności z manifestem, macierzami, rejestrem operationId oraz walidatorami.

W praktyce dokument jest używany jako punkt nawigacyjny dla implementatora, projektanta i osoby prowadzącej odbiór. Nie zastępuje szczegółowego kontraktu ekranu, komponentu ani API, lecz opisuje regułę czytania i miejsce, w którym należy szukać danych kanonicznych. Jeżeli pojawi się rozbieżność między tym dokumentem a plikiem CSV lub JSON, pierwszeństwo ma jawnie wskazany rejestr kanoniczny, a dokument należy zaktualizować w tej samej zmianie.

### Kryteria akceptacji dokumentu

1. Dokument ma metadane 1.0 i właściciela Artur Wiśniewski.
2. Dokument wskazuje powiązany rejestr, macierz albo obszar specyfikacji.
3. Dokument nie zawiera otwartych decyzji ani niezweryfikowanych pseudo-route’ów.
4. Dokument przechodzi walidację linków lokalnych.
