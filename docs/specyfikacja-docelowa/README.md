---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Specyfikacja docelowa PapaData 1.0

To jest kanoniczny indeks dokumentacji produktu. Dokumentacja jest utrzymywana domenowo: ekrany i procesy są scalone na poziomie modułu, natomiast kontrakty komponentów, API i dokumenty prawne pozostają atomowe, ponieważ są bezpośrednio wiązane z rejestrami, walidatorami lub procesem akceptacji.

## Struktura

- `00-zarzadzanie-dokumentacja/` — zasady utrzymania, rejestry i bramy akceptacyjne;
- `01-fundamenty/`–`06-powloka-produktu-i-nawigacja/` — design system, komponenty, wykresy i shell;
- `07-centrum-dowodzenia/`–`19-centrum-pomocy/` — moduły produktu, po jednym kanonicznym dokumencie na moduł;
- `20-przeplywy-e2e/` — przepływy E2E w trzech katalogach scenariuszy;
- `21-stany-przekrojowe/`–`24-aplikacja-mobilna/` — wzorce, mapy, security i mobile;
- `25-kontrakty-domenowe-i-api/` — kontrakty API według bounded context;
- `26-priorytety-p0/` — obowiązkowe decyzje P0;
- `27-pakiet-prawny-i-organizacyjny/` — osobne dokumenty prawne i compliance.

## Źródła maszynowe

- `rejestry/` — rejestry tras, operacji, komponentów, eventów i Storybooka;
- `macierze/` — powiązania ekranów, komponentów, API, ról, Auth i E2E;
- `contracts/` — kontrakty TypeScript/JSON/OpenAPI;
- `fixtures/` — fixture kontraktowe i scenariuszowe.

## Polityka utrzymania

1. Nie dodajemy do `docs/` datowanych audytów, logów ani raportów jednorazowych.
2. Dowody walidacji są artefaktami wykonania i nie są częścią kanonicznej dokumentacji.
3. Nowy dokument powstaje tylko wtedy, gdy ma odrębny owner, cykl akceptacji albo jest bezpośrednio wskazywany przez kontrakt/rejestr.
4. W pozostałych przypadkach aktualizujemy istniejący dokument domenowy.
5. Każda zmiana ścieżki dokumentu wymaga aktualizacji `rejestry/`, `macierze/` i fixture wskazujących `sourceDocument`.
