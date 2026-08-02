---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-AA0B1D2D486A
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Typografia

## Decyzja kanoniczna 1.0

Kanoniczna para fontów dla PapaData 1.0 to **Instrument Sans** jako font interfejsu oraz **IBM Plex Mono** jako font techniczny. Decyzja jest docelowa dla nowych ekranów, Storybooka i design systemu. Wzmianki o poprzedniej parze fontów są traktowane jako ślad historyczny snapshotu i nie są źródłem nowej implementacji.

## Zakres odpowiedzialności

Typografia definiuje czytelność, hierarchię, rytm i sposób prezentacji danych analitycznych. Nie definiuje ról użytkownika, endpointów, capability ani procesów biznesowych. Wszystkie komponenty korzystają z tokenów typograficznych, a nie z lokalnych wartości CSS.

## Tokeny i aliasy

| Token | Wartość docelowa | Zastosowanie |
|---|---|---|
| `--pd-font-sans` | `Instrument Sans` | tekst UI, nagłówki, formularze, tabele |
| `--pd-font-mono` | `IBM Plex Mono` | identyfikatory, kwoty techniczne, logi, kody, trace ID |
| `--pd-type-display` | 40–48 px | ekranowe nagłówki strategiczne |
| `--pd-type-title` | 24–32 px | tytuły regionów i modułów |
| `--pd-type-body` | 15–16 px | treść podstawowa |
| `--pd-type-caption` | 12–13 px | etykiety pomocnicze, metadane, timestampy |
| `--pd-line-normal` | 1.45–1.6 | tekst roboczy i opisowy |
| `--pd-letter-tight` | -0.02em | duże nagłówki bez efektu ciężkości |

## Reguły użycia

- Nie używać wersalików jako podstawowego sposobu budowania hierarchii.
- Nie stosować ciężkich font-weight jako domyślnej estetyki; wagi 400–500 są standardem, 600 tylko dla krótkich punktów ciężkości.
- Liczby KPI używają tabular numerals, aby wartości nie skakały w tabelach i wykresach.
- Długie opisy analityczne muszą zachować czytelność przy zoom 200%.
- PL/EN ma zachować tę samą hierarchię mimo różnej długości tekstów.

## Decyzja odrzucona

Poprzednia para fontów pozostaje dopuszczalna wyłącznie jako zależność historyczna istniejącego snapshotu lub fallback w migracji. Nie jest docelowym wyborem dla nowych dokumentów, nowych stories ani nowych komponentów.

## Testy

1. Storybook pokazuje skalę dla light/dark, PL/EN i compact/comfortable.
2. Walidator blokuje drugi konkurencyjny wybór fontów w dokumentach docelowych.
3. Komponenty nie deklarują lokalnych rodzin fontów poza tokenami.
4. Nagłówki nie używają all caps jako wymogu wizualnego.
