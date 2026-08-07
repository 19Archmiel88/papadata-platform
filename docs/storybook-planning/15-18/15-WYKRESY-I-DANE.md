# 15 - Wykresy i wizualizacje danych

Storybook display title: `Wykresy i dane`

Story class: `component`

Owner: `Analytics UI`

## Cel sekcji

Jedno docelowe zrodlo prawdy dla komponentow analitycznych. Sekcja nie jest galeria wykresow i nie powinna kopiowac kontrolek z Komponentow Bazowych. Ma okreslic kontrakt danych, anatomie, warianty, stany, zachowanie responsywne i sposob skladania wizualizacji w produkcie.

Decyzje wizualne przetestowane w `05.03 - Powierzchnie danych` powinny zostac tutaj promowane do realnych komponentow.

## 15.01 - ChartFrame

Wlasciciel kompletnej powierzchni wykresu.

Powinien pokazac:
- naglowek i pytanie biznesowe;
- status i swiezosc danych;
- zrodla;
- obszar wykresu;
- legende;
- adnotacje;
- narracyjne podsumowanie;
- alternatywna reprezentacje tabelaryczna;
- akcje kontekstowe i wejscie do Papa Asystenta;
- wariant z filtrem i bez filtra;
- zachowanie przy braku/niepelnych danych.

Nie powinien implementowac wlasnego Button, Select, Tooltip ani tabeli bazowej.

## 15.02 - MetricCard

Wlasciciel KPI / metryki analitycznej.

Warianty:
- podstawowy;
- z trendem;
- z celem;
- z odchyleniem;
- z mikrochartem;
- alarmowy/rekomendacyjny.

Powinien rozstrzygnac:
- wartosc i jednostke;
- okres/porownanie;
- kierunek trendu;
- status danych;
- zmiane definicji metryki;
- brak i czesciowosc danych;
- akcje wyjasnienia przez Papa.

Mikrowykres jest czescia MetricCard, ale jego geometria nie moze tworzyc drugiego pelnego ChartFrame.

## 15.03 - Trendy

Wlasciciel wizualizacji zmian w czasie.

Zakres reprezentatywny:
- przychod;
- zamowienia;
- marza;
- ROAS;
- konwersja;
- ruch;
- actual vs previous period.

Story ma pokazac wariant jednej i wielu serii, rozne gestosci punktow, dlugie zakresy czasu, adnotacje i brakujace fragmenty serii.

## 15.04 - Porownania

Wlasciciel wizualnego porownywania dwoch lub wielu grup.

Zakres:
- kanaly;
- platformy;
- kampanie;
- produkty;
- segmenty klientow;
- okresy;
- workspace.

Ma rozstrzygnac kiedy uzywamy grouped bars, lines, small multiples lub tabeli zamiast wymuszac jeden typ wykresu.

## 15.05 - Struktura i udzial

Wlasciciel wizualizacji composition/share.

Zakres:
- udzial kanalow;
- udzial produktow;
- udzial kampanii;
- nowi vs powracajacy klienci;
- mix przychodu.

Nie nalezy automatycznie preferowac donut/pie. Story ma pokazac zasade wyboru: stacked bar / 100% stack / ranked share / donut tylko gdy jest czytelny i uzasadniony.

## 15.06 - Zaleznosci i korelacje

Wlasciciel wizualizacji relacji miedzy zmiennymi.

Zakres:
- koszt vs przychod;
- ROAS vs budzet;
- ruch vs zamowienia;
- AOV vs segment;
- marza vs promocja.

Powinien rozstrzygnac scatter/bubble/connected comparison i sposob pokazywania outlierow bez sugerowania przyczynowosci tam, gdzie dane pokazuja tylko korelacje.

## 15.07 - Prognoza i AI

Wlasciciel wizualizacji prognozy, a nie calego AI produktu.

Powinien pokazac:
- wynik rzeczywisty;
- prognoze;
- granice/scenariusze;
- confidence jako opisowy poziom, nie pseudo-precyzyjny procent bez podstawy;
- ograniczenia danych;
- rekomendacje jako warstwe powiazana, nie wbudowana logike AssistantShell.

## 15.08 - Stany danych

Kanoniczny katalog stanow dla wizualizacji analitycznych:
- ready;
- partial;
- stale;
- no data;
- conflict;
- provider error;
- processing;
- unavailable.

Ta story ma definiowac zachowanie komponentow analitycznych. Nie moze kopiowac ogolnego `18.02 Empty/Error/No access` ani `18.08 Status danych i readiness`.

Granica:
- `15.08` = jak WYKRES/KPI reaguje na stan danych;
- `18.08` = jak CALY WIDOK/PATTERN komunikuje readiness danych.

## 15.09 - Interakcje i filtry wykresow

Nazwa rekomendowana: `Interakcje i filtry wykresow` zamiast ogolnego `Interakcje i filtry`.

Zakres:
- hover/focus na datapointach;
- tooltip danych;
- wybor serii;
- zaznaczenie zakresu;
- drill-down;
- zoom tylko gdy ma wartosc analityczna;
- synchronizacja z DateRange/FilterBar;
- reset lokalnego kontekstu.

Ta story NIE implementuje nowych kontrolek formularzowych. Konsumuje `Select`, `DateRange`, `Tabs`, `Button/TextAction` i przyszly `FilterBar`.

## 15.10 - Responsywnosc i tryby prezentacji

Nazwa rekomendowana: `Responsywnosc i tryby prezentacji`.

Formalne WCAG nie jest celem biznesowym tej sekcji. Zachowujemy jednak techniczna semantyke i obsluge, ktora zapobiega bledom komponentow.

Zakres:
- desktop wide;
- desktop standard;
- tablet;
- mobile;
- compact density;
- dlugie etykiety;
- duzo serii;
- alternatywna tabela/lista, gdy wykres przestaje byc czytelny;
- reduced motion tylko dla animowanych przejsc wykresu;
- brak poziomego scrolla jako podstawowego rozwiazania layoutu.

## Czego sekcja 15 nie powinna zawierac

- kolejnego katalogu Button/Select/Tooltip;
- AppShell/sidebar/topbar;
- domenowych ekranow Command Center;
- pelnego workflow AI;
- przypadkowych eksperymentow wizualnych pozostawionych po 05.03;
- duplikatu DataTable, EvidencePanel czy RecommendationCard.
