# 15 - Wykresy i dane

Story class: `component`

Owner: `Analytics UI`

## Cel sekcji

Jedno docelowe źródło prawdy dla komponentów analitycznych. Sekcja nie jest galerią wykresów i nie powinna kopiować kontrolek z Komponentów Bazowych. Ma określić kontrakt danych, anatomię, warianty, stany, zachowanie responsywne i sposób składania wizualizacji w produkcie.

Decyzje wizualne przetestowane w `05.03 - Powierzchnie danych` powinny zostać tutaj promowane do realnych komponentów.

## 15.01 - ChartFrame

Właściciel kompletnej powierzchni wykresu.

Powinien pokazać:
- nagłówek i pytanie biznesowe;
- status i świeżość danych;
- źródła;
- obszar wykresu;
- legende;
- adnotacje;
- narracyjne podsumowanie;
- alternatywną reprezentację tabelaryczną;
- akcje kontekstowe i wejście do Papa Asystenta;
- wariant z filtrem i bez filtra;
- zachowanie przy braku/niepełnych danych.

Nie powinien implementować własnego Button, Select, Tooltip ani tabeli bazowej.

## 15.02 - MetricCard

Właściciel KPI / metryki analitycznej.

Warianty:
- podstawowy;
- z trendem;
- z celem;
- z odchyleniem;
- z mikrochartem;
- alarmowy/rekomendacyjny.

Powinien rozstrzygnąć:
- wartość i jednostkę;
- okres/porównanie;
- kierunek trendu;
- status danych;
- zmianę definicji metryki;
- brak i częściowość danych;
- akcje wyjaśnienia przez Papa.

Mikrowykres jest częścią MetricCard, ale jego geometria nie może tworzyć drugiego pełnego ChartFrame.

## 15.03 - Trendy

Właściciel wizualizacji zmian w czasie.

Zakres reprezentatywny:
- przychód;
- zamówienia;
- marża;
- ROAS;
- konwersja;
- ruch;
- actual vs previous period.

Story ma pokazać wariant jednej i wielu serii, różne gęstości punktów, długie zakresy czasu, adnotacje i brakujące fragmenty serii.

## 15.04 - Porownania

Właściciel wizualnego porównywania dwóch lub wielu grup.

Zakres:
- kanały;
- platformy;
- kampanie;
- produkty;
- segmenty klientów;
- okresy;
- workspace.

Ma rozstrzygnąć, kiedy używamy grouped bars, lines, small multiples lub tabeli zamiast wymuszać jeden typ wykresu.

## 15.05 - Udziały i struktura

Właściciel wizualizacji composition/share.

Zakres:
- udział kanałów;
- udział produktów;
- udział kampanii;
- nowi vs powracający klienci;
- mix przychodu.

Nie należy automatycznie preferować donut/pie. Story ma pokazać zasadę wyboru: stacked bar / 100% stack / ranked share / donut tylko gdy jest czytelny i uzasadniony.

## 15.06 - Zależności i korelacje

Właściciel wizualizacji relacji między zmiennymi.

Zakres:
- koszt vs przychód;
- ROAS vs budżet;
- ruch vs zamówienia;
- AOV vs segment;
- marża vs promocja.

Powinien rozstrzygnąć scatter/bubble/connected comparison i sposób pokazywania outlierów bez sugerowania przyczynowości tam, gdzie dane pokazują tylko korelacje.

## 15.07 - Prognoza i AI

Właściciel wizualizacji prognozy, a nie całego AI produktu.

Powinien pokazać:
- wynik rzeczywisty;
- prognozę;
- granice/scenariusze;
- confidence jako opisowy poziom, nie pseudo-precyzyjny procent bez podstawy;
- ograniczenia danych;
- rekomendacje jako warstwę powiązaną, nie wbudowaną logikę AssistantShell.

## 15.08 - Stany danych

Kanoniczny katalog stanów dla wizualizacji analitycznych:
- ready;
- partial;
- stale;
- no data;
- conflict;
- provider error;
- processing;
- unavailable.

Ta story ma definiować zachowanie komponentów analitycznych. Nie może kopiować ogólnego `18.02 Empty/Error/No access` ani `18.08 Status danych i readiness`.

Granica:
- `15.08` = jak WYKRES/KPI reaguje na stan danych;
- `18.08` = jak CALY WIDOK/PATTERN komunikuje readiness danych.

## 15.09 - Interakcje i filtry wykresów

Nazwa rekomendowana: `Interakcje i filtry wykresów` zamiast ogólnego `Interakcje i filtry`.

Zakres:
- hover/focus na datapointach;
- tooltip danych;
- wybór serii;
- zaznaczenie zakresu;
- drill-down;
- zoom tylko gdy ma wartość analityczną;
- synchronizacja z DateRange/FilterBar;
- reset lokalnego kontekstu.

Ta story NIE implementuje nowych kontrolek formularzowych. Konsumuje `Select`, `DateRange`, `Tabs`, `Button/TextAction` i przyszły `FilterBar`.

## 15.10 - Responsywność i tryby prezentacji

Nazwa rekomendowana: `Responsywność i tryby prezentacji`.

Podstawowy gate dostępności tej sekcji obejmuje tylko: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

Zakres:
- desktop wide;
- desktop standard;
- tablet;
- mobile;
- compact density;
- długie etykiety;
- dużo serii;
- alternatywna tabela/lista, gdy wykres przestaje być czytelny;
- reduced motion tylko dla animowanych przejść wykresu;
- brak poziomego scrolla jako podstawowego rozwiązania layoutu.

## Czego sekcja 15 nie powinna zawierać

- kolejnego katalogu Button/Select/Tooltip;
- AppShell/sidebar/topbar;
- domenowych ekranów Command Center;
- pełnego workflow AI;
- przypadkowych eksperymentów wizualnych pozostawionych po 05.03;
- duplikatu DataTable, EvidencePanel czy RecommendationCard.

## Evidence

Aktualny dowód techniczny po zmianach P1: [SECTION-15-EVIDENCE-2026-08-12.md](./SECTION-15-EVIDENCE-2026-08-12.md).

## Zasada warstw canvasu

Obowiązujący dokument: `SECTION-15-CANVAS-LAYER-RULE.md`. Podpowiedzi, wnioski, rekomendacje, tabele alternatywne, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność i jakość predykcji nie są częścią obszaru wykresu; są osobnymi warstwami na głównym canvasie z własną głębią i statusem.

### Doprecyzowanie wizualne

Dla story 15 domyślny układ desktopowy używa prawej szyny canvasu dla podpowiedzi, wniosków, rekomendacji, alertów, ryzyk i komentarzy interpretacyjnych. Elementy te nie mogą być dolnym ani bocznym panelem tej samej ramy wykresu. Tabela danych rozwija się płasko pod wykresem bez dodatkowej powierzchni i bez zmiany wysokości Papa Asystenta.

### Status odbioru wizualnego

Wygląd sekcji 15 jest zaakceptowany po pełnym skanie 2026-08-11. Akceptowany układ `ChartFrame` ma legendę jako ostatni element wykresu, prawą szynę `Papa Asystent` + `Panel rekomendacji` o wysokości powierzchni wykresu oraz stabilne wiersze `Podpowiedź danych` bez przesunięć na hover/focus.
