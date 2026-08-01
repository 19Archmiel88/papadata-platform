# PapaData — Foundation System V1 Evidence

## 1. Cel

Evidence nie jest jedynie potwierdzeniem, że Chrome zapisał plik PNG. Ma wykazać:

- pełną zawartość każdej story;
- poprawny light i dark;
- realny reflow mobile/tablet;
- rzeczywisty focus klawiatury;
- rozdzielenie selected i active w listboxie;
- różnicę między full i reduced motion;
- pierwszeństwo systemowego `prefers-reduced-motion`;
- brak uciętych sekcji oraz błędów wizualnych.

## 2. Uruchomienie

Najpierw wykonaj pełną bramę:

```bash
pnpm --filter @papadata/web check-storybook-catalog
pnpm --filter @papadata/web check-foundation-system
pnpm --filter @papadata/web typecheck
pnpm --filter @papadata/web build
pnpm --filter @papadata/web build-storybook
git diff --check
```

Następnie wygeneruj evidence:

```bash
pnpm --filter @papadata/web capture-foundation-evidence -- "/ścieżka/do/katalogu-evidence"
```

## 3. Model przechwytywania

Skrypt używa Chrome DevTools Protocol i:

- odczytuje identyfikatory z `storybook-static/index.json`;
- ustawia właściwy viewport i globale;
- czeka na załadowanie fontów i dwa cykle renderowania;
- wykonuje pełnostronicowe screenshoty z `captureBeyondViewport`;
- osobno wykonuje evidence interakcyjne;
- zapisuje w manifeście wysokość dokumentu i wysokość przechwyconą;
- oznacza przypadek jako `FAIL`, jeżeli pełna strona została ucięta;
- zapisuje `actionEvidence` dla focusu, listboxa i motion.

## 4. Macierz podstawowa

Dla wszystkich 13 stories:

```text
light / PL / comfortable / full / desktop / full-page
dark  / PL / comfortable / full / desktop / full-page
```

## 5. Macierz uzupełniająca

- Typografia: EN, desktop, full-page.
- Typografia: PL, mobile, full-page.
- Odstępy i siatka: compact, tablet, full-page.
- Tło Auth: dark, mobile, full-page.
- Canvas aplikacji: compact, mobile, full-page.
- Powierzchnia danych: dark, compact, tablet, full-page.
- Motion: global reduced, full-page.
- Motion: system reduced przy globalnym full, full-page.

## 6. Evidence interakcyjne

Obowiązkowe dodatkowe przypadki:

1. primary focus-visible w light;
2. primary focus-visible w dark;
3. listbox: selected i active są różnymi opcjami w light;
4. listbox: selected i active są różnymi opcjami w dark;
5. uruchomiony wariant full motion;
6. uruchomiony wariant local reduced motion.

Manifest musi zapisać:

```text
action
activeText / focusVisible
selected / active / areDifferent
requested / effective / transform
```

## 7. Manualny odbiór

Po automatycznym `PASS` właściciel produktu sprawdza wizualnie:

1. żadna sekcja nie jest ucięta;
2. overlay scrim ma czytelną treść w light i dark;
3. wykresy demonstracyjne nie wyglądają jak puste lub niedoładowane;
4. mobile ma kontrolowaną skalę display/page title;
5. polska wersja nie zawiera angielskiego copy użytkowego;
6. ikony rozdzielają polską nazwę kategorii od technicznego ID;
7. promienie mają jawne mapowanie na role komponentów;
8. Auth jest oznaczony jako laboratorium powierzchni, nie zatwierdzony ekran produkcyjny;
9. Canvas mobile nie sugeruje obecności widocznego sidebara;
10. local reduced motion różni się od full również przy globalnym `motion=full`.

## 8. Metryka odbioru

Ocena końcowa:

```text
ACCEPTED
CONDITIONAL
REJECTED
```

`ACCEPTED` wymaga:

- 16/16 stories widocznych;
- wszystkich checkerów `PASS`;
- typecheck `PASS`;
- build aplikacji i Storybooka `PASS`;
- pełnostronicowego manifestu bez ucięć;
- kompletu przypadków interakcyjnych;
- braku blokera focus/keyboard/screen reader;
- akceptacji wizualnej właściciela produktu.

## Aktualny zamrożony baseline

- Fundamenty: `00.01–00.11`.
- Laboratorium: `05.01–05.05`.
- Łącznie: `16/16` aktywnych i zamrożonych stories.
- Kanoniczna para fontów: `Inter` i `JetBrains Mono`.
- Kanoniczne czasy Motion: `70 / 110 / 180 / 240 ms`.
- Zaakceptowane stories są źródłem dla dokumentacji i dalszych sekcji.
