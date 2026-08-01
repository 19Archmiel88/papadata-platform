# PapaData - decyzje taksonomii Storybooka

Decyzja: `SB-TAXONOMY-002`
Status: `accepted`
Zrodlo maszynowe: `apps/web/src/storybook-next/storybook-taxonomy-map.json`
Zrodlo katalogu: `apps/web/src/storybook-next/storybook-contract.json`

## Stan aktywnej warstwy wizualnej

Aktywna warstwa wizualna Storybooka dziala w etapie Component System V1. Dozwolone sa wylacznie zaakceptowane stories zgodne z kontraktem, taksonomia i kanonicznymi foundations. Tokeny --pds-* oraz rownolegla legacy visual layer pozostaja zabronione.

- wymagania: 223 pozycji w kontrakcie;
- aktywne stories: 19;
- prototypeStatus implemented: 0;
- storyStatus implemented: 19;
- wszystkie aktywne stories musza wynikac z kontraktu, taksonomii i biezacych foundations.

## Cel

Logiczne przypisanie 223 wymagań do kanonicznych rootów po aktywacji Component System V1.

## Kanoniczne rooty

| Root | Nazwa | Widocznosc | Cykl zycia | Przeznaczenie |
|---|---|---|---|---|
| 00 | Fundamenty | visible | permanent | Tokeny, typografia, ikonografia, focus, motion, dostępność i zasady bazowe. |
| 05 | Laboratorium decyzji | visible | temporary | Porównywanie wariantów wizualnych przed przeniesieniem zaakceptowanej decyzji do warstwy docelowej. |
| 10 | Komponenty | visible | permanent | Produkcyjne primitives i components wraz z API, stories i testami. |
| 20 | Wzorce | visible | permanent | Kompozycje komponentów, stany przekrojowe, tabele, wykresy i wzorce danych. |
| 25 | Powłoki | visible | permanent | AuthShell, AppShell, topbary, sidebar, AssistantLayer i globalny system warstw. |
| 30 | Dashboard | visible | permanent | Centrum Dowodzenia i moduły analityczno-biznesowe. |
| 40 | Papa Asystent | visible | permanent | Papa Asystent, Laboratorium AI, rekomendacje i kontrolowane działania AI. |
| 50 | Integracje | visible | permanent | Integracje, synchronizacja, jakość danych, readiness i recovery. |
| 60 | Ustawienia | visible | permanent | Profil, firma, zespół, bezpieczeństwo, governance i konfiguracja. |
| 70 | Subskrypcja | visible | permanent | Plany, płatności, faktury, limity i entitlementy. |
| 80 | Pomoc | visible | permanent | Centrum Pomocy, procedury, wyszukiwanie i kontakt ze wsparciem. |
| 90 | Przepływy | visible | permanent | Kompletne procesy wieloekranowe i przekrojowe scenariusze produktu. |
| INTERNAL | Dokumentacja wewnętrzna | hidden | internal | Mapy, indeksy i informacje governance niewidoczne jako docelowy root produktu. |

## Mapowanie wymagan

| Sekcja kontraktu | Nazwa | Root docelowy | Planowana sciezka | Dyspozycja | Decyzja |
|---|---|---|---|---|---|
| 00 | Fundamenty | 00 Fundamenty | 00 Fundamenty | keep | Sekcja pozostaje kanonicznym rootem fundamentów. |
| 05 | Tła i powierzchnie | 05 Laboratorium decyzji | 05 Laboratorium decyzji / Tła i powierzchnie | temporary | Sekcja pozostaje tymczasowym laboratorium do czasu przeniesienia zaakceptowanych wariantów do fundamentów i komponentów. |
| 10 | Komponenty | 10 Komponenty | 10 Komponenty | keep | Sekcja pozostaje rootem komponentów, ale docelowo prezentuje implementacje produkcyjne zamiast ShowcaseKit. |
| 15 | Wykresy i wizualizacje danych | 20 Wzorce | 20 Wzorce / Wykresy i wizualizacje danych | consolidate | Wykresy są wzorcami danych i nie tworzą osobnego kanonicznego rootu. |
| 18 | Wzorce i stany przekrojowe | 20 Wzorce | 20 Wzorce / Stany i wzorce przekrojowe | consolidate | Sekcja staje się częścią kanonicznego rootu Wzorce. |
| 20 | Powłoka produktu i nawigacja | 25 Powłoki | 25 Powłoki | split | Większość wpisów należy do Powłok; pojedyncze wzorce i flow są rozdzielane przez entryOverrides. |
| 25 | Dostęp, rejestracja i onboarding — M01 | 90 Przepływy | 90 Przepływy / Auth, rejestracja i onboarding | split | Obecne pozycje są powierzchniami i procesami. Przyszłe primitives, wzorce i AuthShell trafią odpowiednio do rootów 10, 20 i 25. |
| 30 | Centrum Dowodzenia — M04 | 30 Dashboard | 30 Dashboard / Centrum Dowodzenia | keep | Centrum Dowodzenia pozostaje głównym modułem Dashboardu. |
| 31 | Kampanie płatne — M05 | 30 Dashboard | 30 Dashboard / Kampanie płatne | consolidate | Moduł biznesowy staje się podsekcją Dashboardu. |
| 32 | Zamówienia — M06 | 30 Dashboard | 30 Dashboard / Zamówienia | consolidate | Moduł biznesowy staje się podsekcją Dashboardu. |
| 33 | Produkty — M07 | 30 Dashboard | 30 Dashboard / Produkty | consolidate | Moduł biznesowy staje się podsekcją Dashboardu. |
| 34 | Klienci — M08 | 30 Dashboard | 30 Dashboard / Klienci | consolidate | Moduł biznesowy staje się podsekcją Dashboardu. |
| 35 | Ruch na stronie i lejek sprzedażowy — M09 | 30 Dashboard | 30 Dashboard / Ruch i lejek sprzedażowy | consolidate | Moduł biznesowy staje się podsekcją Dashboardu. |
| 40 | Integracje i synchronizacja — M10 | 50 Integracje | 50 Integracje / Połączenia i synchronizacja | renumber | Integracje otrzymują kanoniczny root 50. |
| 41 | Jakość danych i integralność — M11 | 50 Integracje | 50 Integracje / Jakość danych i readiness | consolidate | Jakość danych jest częścią cyklu integracji, synchronizacji i readiness. |
| 50 | Papa Asystent i Laboratorium AI — M12 | 40 Papa Asystent | 40 Papa Asystent | renumber | Papa Asystent otrzymuje kanoniczny root 40. |
| 60 | Ustawienia, zespół i bezpieczeństwo — M13 | 60 Ustawienia | 60 Ustawienia | keep | Sekcja pozostaje kanonicznym rootem ustawień. |
| 70 | Subskrypcja i płatności — M14 | 70 Subskrypcja | 70 Subskrypcja | keep | Sekcja pozostaje kanonicznym rootem subskrypcji i płatności. |
| 80 | Decyzje, działania i pomiar — M15 | 30 Dashboard | 30 Dashboard / Decyzje, działania i pomiar | split | Centrum decyzji i pomiar pozostają częścią Dashboardu; wpisy bezpośrednio związane z AI są przekierowane do Papa Asystenta. |
| 85 | Centrum Pomocy | 80 Pomoc | 80 Pomoc / Centrum Pomocy | renumber | Centrum Pomocy otrzymuje kanoniczny root 80. |
| 90 | Przepływy kompletne | 90 Przepływy | 90 Przepływy | keep | Sekcja pozostaje rootem kompletnych procesów przekrojowych. |
| 99 | Mapa produktu i indeks Storybooka | INTERNAL Dokumentacja wewnętrzna | Dokumentacja wewnętrzna / Mapa produktu i indeks | hide | Mapa i indeks pozostają źródłem governance, ale nie są docelowym rootem nawigacji produktu. |

## Wyjatki na poziomie pozycji

| entryId | Pozycja | Root docelowy | Planowana sciezka | Uzasadnienie |
|---|---|---|---|---|
| 10.01 | Marka | 10 Komponenty | 10 Komponenty bazowe / Marka | Aktywna implementacja Component System V1 zachowuje zaakceptowaną ścieżkę story. |
| 10.02 | Przyciski i akcje | 10 Komponenty | 10 Komponenty bazowe / Przyciski i akcje | Aktywna implementacja Component System V1 zachowuje zaakceptowaną ścieżkę story. |
| 10.11 | Ikony | 10 Komponenty | 10 Komponenty bazowe / Ikony | Aktywna implementacja Component System V1 zachowuje zaakceptowaną ścieżkę story. |
| 20.06 | Workspace switcher | 20 Wzorce | 20 Wzorce / WorkspaceSwitcher | WorkspaceSwitcher jest współdzielonym wzorcem, nie pełną powłoką. |
| 20.07 | Global search i Command Palette | 90 Przepływy | 90 Przepływy / GlobalSearch | Global search i Command Palette wymagają scenariusza interakcji przekrojowej. |
| 20.08 | Powiadomienia | 20 Wzorce | 20 Wzorce / NotificationCenter | NotificationCenter jest współdzielonym wzorcem używanym przez powłokę. |
| 20.09 | Centrum operacji w tle | 20 Wzorce | 20 Wzorce / Centrum operacji w tle | Statusy operacji są wzorcem procesowym, a nie anatomią AppShell. |
| 20.10 | OverlayRoot i system warstw | 25 Powłoki | 25 Powłoki / OverlayRoot | OverlayRoot jest globalnym regionem powłoki. |
| 80.02 | Obserwacje | 40 Papa Asystent | 40 Papa Asystent / Obserwacje | Obserwacje są częścią cyklu analitycznego Papa Asystenta. |
| 80.03 | Rekomendacje | 40 Papa Asystent | 40 Papa Asystent / Rekomendacje | Rekomendacje są wspólną powierzchnią Papa Asystenta i AI Actions. |
| 80.05 | Brief działania | 40 Papa Asystent | 40 Papa Asystent / Brief działania | Brief działania jest elementem kontrolowanego cyklu AI Actions. |
| 80.06 | Szczegóły działania | 40 Papa Asystent | 40 Papa Asystent / Szczegóły działania | Szczegóły działania należą do kontrolowanego cyklu wykonania i recovery. |
| 80.08 | Biblioteka działań | 40 Papa Asystent | 40 Papa Asystent / Biblioteka działań | Biblioteka działań jest częścią historii i governance działań AI. |

## Rozklad 223 wymagan

| Root | Liczba pozycji |
|---|---:|
| 10 Komponenty | 12 |
| 20 Wzorce | 23 |
| 25 Powłoki | 7 |
| 30 Dashboard | 61 |
| 40 Papa Asystent | 22 |
| 50 Integracje | 20 |
| 60 Ustawienia | 10 |
| 70 Subskrypcja | 10 |
| 80 Pomoc | 6 |
| 90 Przepływy | 29 |
| 00 Fundamenty | 11 |
| 05 Laboratorium decyzji | 5 |
| INTERNAL Dokumentacja wewnętrzna | 7 |

## Zasady dalszego rozwoju

- Nie wolno przywracac ShowcaseKit ani starej warstwy CSS.
- Nowe story musi miec wpis w kontrakcie i tytul zgodny z docelowym rootem taksonomii.
- Laboratorium decyzji pozostaje miejscem dla jawnych demonstracji foundations przed przeniesieniem decyzji do warstwy docelowej.
- Zmiana storyStatus, prototypeStatus, productionStatus i testStatus wymaga rzeczywistego dowodu.
- Lista 223 wymagan pozostaje zakresem produktu, a nie lista aktywnych atrap.

## Integralnosc

- Contract identity SHA-256: `3103a18fc7aa4e4c00006cfbb7248526836df7dcc8d93c8f8e8fe895fdd2736e`
- Taxonomy SHA-256: `015b17c62f58db6debae5e10d03d7bf30a9d8b0de7a56ae152ce8a3f93b74566`

<!-- GENERATED BY scripts/check-storybook-taxonomy.mjs --write-doc -->
