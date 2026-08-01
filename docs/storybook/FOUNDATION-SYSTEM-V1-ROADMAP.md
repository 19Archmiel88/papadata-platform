# PapaData — Foundation System V1

## Status dokumentu

- Zakres: początkowy release Storybooka PapaData.
- Cel: kompletne fundamenty przed rozpoczęciem primitives, formularzy, Auth, AppShella i modułów.
- Źródło maszynowe: `apps/web/src/storybook-next/storybook-contract.json`.
- Stabilne identyfikatory: istniejące entries `00.01–00.08` i `05.01–05.05`.
- Brama końcowa: `FOUNDATION SYSTEM V1 — ACCEPTED`.

## 1. Decyzja nadrzędna

Początkowy etap nie jest zestawem kilku wizualnych stories. Jest kontraktem dla całej dalszej warstwy UI:

```text
marka i kierunek
→ tokeny i motywy
→ typografia i formatowanie
→ spacing, density i grid
→ geometria i głębia
→ focus, klawiatura i czytnik ekranu
→ motion i reduced motion
→ powierzchnie referencyjne
→ governance, testy i evidence
```

Nie rozpoczynamy `Button`, formularzy, pełnego Auth, AppShella ani modułów `30+`, dopóki ta brama nie zostanie zamknięta.

## 2. Interpretacja liczby stories

Roadmapa produktowa opisuje około 24 referencyjne obszary. Aktualny kontrakt maszynowy ma 13 stabilnych entries F0. Nie tworzymy drugiej numeracji ani równoległego katalogu.

Trzynaście stories pokrywa pełny zakres przez wielosekcyjne referencje:

| Entry | Story | Pokrywane obszary |
|---|---|---|
| `00.01` | Kierunek wizualny | charakter, marka, dozwolone i odrzucone kierunki |
| `00.02` | Typografia | skala, liczby, PL/EN, daty, waluty, długie treści |
| `00.03` | Kolory semantyczne | marka, UI, statusy, focus, paleta danych |
| `00.04` | Odstępy i siatka | spacing, density, 12/8/4 kolumny, reflow |
| `00.05` | Promienie, obramowania i cienie | geometria, borders, elevation, separacja |
| `00.06` | Ikonografia | stroke, rozmiary, kategorie, accessible names |
| `00.07` | Motion | duration, easing, feedback, reduced motion |
| `00.08` | Dostępność | focus, keyboard, listbox, screen reader, live region, reflow |
| `05.01` | Tło Auth | login, register, MFA, recovery, invitation, mobile |
| `05.02` | Canvas aplikacji | sidebar, bez sidebara, panel Papa, compact, mobile |
| `05.03` | Powierzchnia danych | MetricCard, ChartFrame, DataTable, panele kontekstowe |
| `05.04` | Separatory i obramowania | sekcje, topbar, sidebar, tabela, drawer, sticky |
| `05.05` | Gradienty, światło i szkło | baseline bez efektu, warianty kontrolowane, zakazy |

## 3. Zakres techniczny

### 3.1 Jedno źródło tożsamości

- Jedna implementacja `PapaDataBrand`.
- Sygnet `P + dokładnie 3 słupki`.
- Jeden lockup dla light i dark.
- Brak `--demo-brand-*`.
- Wszystkie stories i canvasy korzystają z tego samego komponentu.

### 3.2 Tokeny

Tokeny globalne są definiowane wyłącznie w:

```text
apps/web/src/design-system/foundations/themes/carbon-pearl.css
```

Obowiązuje wyłącznie prefiks `--pd-*`.

Zakres obejmuje:

- marka;
- surfaces;
- tekst;
- separatory;
- interakcje i treść na interakcji;
- focus zwykły i focus na primary;
- statusy;
- paleta danych;
- spacing, density i grid;
- radius i borders;
- shadows i elevation;
- gradient, scrim i glass;
- motion.

### 3.3 Locale

Global `locale` musi zmieniać realną treść albo realny format, a nie tylko atrybut `lang`.

Foundation System dokumentuje:

- PL/EN;
- liczby;
- PLN;
- procenty;
- zakres dat;
- czas względny;
- długie tłumaczenia.

### 3.4 Dostępność — zakres F0

W F0 twardą bramą są:

- realny `:focus-visible`;
- obsługa klawiatury;
- focus return;
- Escape i strzałki w listboxie;
- accessible name;
- semantyczne HTML;
- `aria-live` i `role=status`;
- tabela z caption i nagłówkami;
- screen-reader friendly statusy;
- forced-colors fallback dla focusu;
- reduced motion;
- reflow.

Pełna formalna certyfikacja WCAG i matematyczna optymalizacja wszystkich kombinacji kolorystycznych nie są bramą tego release’u. Kolory podlegają ocenie czytelności wizualnej, a nie osobnemu programowi certyfikacyjnemu. Focus musi jednak pozostać jednoznacznie widoczny.

### 3.5 Reduced motion

Preferencja systemowa `prefers-reduced-motion: reduce` ma pierwszeństwo przed żądanym globalem Storybooka. Runtime zapisuje:

```text
data-motion-requested
data-motion
```

Pierwszy atrybut dokumentuje żądanie, drugi tryb efektywny.

## 4. Governance i statusy

Nie tworzymy nowego manifestu obok kontraktu. Rozwijamy obecne źródło:

```text
storybook-contract.json
```

Statusy pozostają rozdzielone:

- `documentationStatus`;
- `prototypeStatus`;
- `productionStatus`;
- `testStatus`;
- `storyStatus`;
- `storyVisibility`.

`storyStatus=implemented` oznacza, że story istnieje i jest częścią kontraktu. Nie oznacza produkcyjnego wdrożenia komponentów ani pełnego przejścia testów.

## 5. Brama techniczna

Obowiązkowe polecenia wynikające z aktualnego repozytorium:

```bash
pnpm --filter @papadata/web check-storybook-catalog
pnpm --filter @papadata/web check-foundation-system
pnpm --filter @papadata/web typecheck
pnpm --filter @papadata/web build-storybook
git diff --check
```

Skrót:

```bash
pnpm verify:foundation-system
```

## 6. Brama wizualna

Do odbioru trafiają:

- wszystkie 13 stories w light i dark;
- Typografia w PL i EN;
- mobile Typografii;
- compact dla spacing/grid;
- mobile Auth;
- mobile Canvas aplikacji;
- tablet/compact dla powierzchni danych;
- Motion w global `reduced`;
- Motion przy systemowym reduced i globalnym `full`;
- fokus primary po wykonaniu play testu.

Nie wykonujemy pełnych 64 kombinacji dla każdej story. Macierz jest rozłożona świadomie pomiędzy stories wysokiego ryzyka.

## 7. Definition of Done

Status `FOUNDATION SYSTEM V1 — ACCEPTED` może zostać nadany dopiero, gdy:

### Wizualne

- tożsamość PapaData jest zatwierdzona;
- light i dark są spójne;
- interfejs nie wygląda jak generyczny SaaS;
- marka, interakcje, dane i statusy są rozdzielone;
- hierarchia powierzchni jest czytelna;
- brak ciężkiego glow, przypadkowego glass i nadprodukcji kart;
- spacing, radius, separatory i elevation są konsekwentne.

### Techniczne

- 16/16 entries jest widoczne i zaimplementowane w kontrakcie;
- wszystkie tokeny mają jedno źródło;
- nie ma `--pds-*`, `--demo-brand-*`, ShowcaseKit ani legacy visual layer;
- runtime obsługuje theme, locale, density i motion;
- locale zmienia realne formaty;
- system reduced motion ma pierwszeństwo;
- checkery i build przechodzą.

### Interakcyjne i semantyczne

- focus jest realnym DOM focus;
- primary ma odrębny token focusu;
- listbox obsługuje strzałki, Enter, Space, Escape i focus return;
- icon-only controls mają accessible names;
- komunikaty dynamiczne są ogłaszane;
- tabele mają caption, scope i tekstowe statusy;
- play tests przechodzą podczas uruchomienia Storybook testów/interakcji.

### Evidence

- komplet screenshotów z manifestem;
- raport checkerów;
- wynik typecheck;
- wynik build Storybooka;
- branch, commit bazowy i data;
- decyzja `accepted`, `conditional` albo `rejected`.

## 8. Następny etap

Dopiero po formalnej akceptacji Foundation System V1 rozpoczynamy:

```text
Button
→ Input i kontrolki
→ formularze
→ feedback
→ overlaye
→ PublicTopbar i AuthShell
```

## 9. Finalne utwardzenie wizualne przed odbiorem

Finalny patch F0 zamyka problemy wykryte podczas pierwszego audytu evidence:

1. screenshoty wszystkich stories są pełnostronicowe;
2. focus primary i selected/active listbox mają osobne evidence interakcyjne;
3. full i local reduced motion są rozdzielone także przy globalnym `motion=full`;
4. systemowe reduced motion nadal ma pierwszeństwo;
5. overlay scrim ma dedykowane role tekstu w light i dark;
6. polskie globale zmieniają copy użytkowe i formaty liczb;
7. display i page title mają kontrolowaną skalę mobile;
8. demonstracje wykresów mają określoną wysokość i nie renderują się jako puste powierzchnie;
9. ikonografia rozdziela przetłumaczoną nazwę kategorii od technicznego ID;
10. promienie pokazują mapowanie na role komponentów;
11. canvas mobile jest opisany jako układ responsywny, nie jako widoczny sidebar;
12. Tło Auth jest jawnie opisane jako laboratorium powierzchni, nie zatwierdzony ekran produkcyjny.

Po zastosowaniu patcha finalny odbiór wymaga ponownego uruchomienia pełnej bramy technicznej i wygenerowania nowego pakietu evidence.

## Aktualny zamrożony baseline

- Fundamenty: `00.01–00.11`.
- Laboratorium: `05.01–05.05`.
- Łącznie: `16/16` aktywnych i zamrożonych stories.
- Kanoniczna para fontów: `Inter` i `JetBrains Mono`.
- Kanoniczne czasy Motion: `70 / 110 / 180 / 240 ms`.
- Zaakceptowane stories są źródłem dla dokumentacji i dalszych sekcji.
