---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
story_id: "00.02"
story_title: "Typografia"
decision_status: "accepted"
prototype_status: "implemented"
production_status: "not_started"
test_status: "passing"
applies_to:
  - desktop
  - light
  - dark
  - pl
  - comfortable
  - full_motion
approved_commit: "94ea15ab11d018252944b36fdc55df8b7462e30a"
approved_evidence: "foundation-evidence/manifest.json"
owner: Artur Wiśniewski
updated_at: 2026-08-03
status: stage-01-accepted
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Typografia

## Decyzja

Kanoniczna para fontów to Inter dla interfejsu użytkownika oraz JetBrains Mono dla danych technicznych, identyfikatorów, wartości systemowych, kodu i treści monospace.

## Publiczne role

| Rola | Token CSS | Zastosowanie |
|---|---|---|
| sans | `--pd-font-sans` | UI, nagłówki, formularze, tabele |
| mono | `--pd-font-mono` | dane techniczne i identyfikatory |
| label | `--pd-type-size-label` | etykiety i krótkie metadane |
| heading1-heading5 | `--pd-type-size-heading-*` | hierarchia nagłówków komponentów |
| headingSmall | `--pd-type-size-heading-small` | kompaktowe nagłówki paneli |
| tight | `--pd-line-height-tight` | zwarte nagłówki i tytuły |

## Reguły użycia

- zwykły tekst, nawigacja, formularze i przyciski używają Inter
- liczby techniczne mogą używać JetBrains Mono z tabular numerals
- font monospace nie służy do zwykłych opisów ani nawigacji
- hierarchia wynika z rozmiaru, line-height i weight, nie z wersalików
- dokumentacja i tokeny nie utrzymują konkurencyjnych fontów

## Formatowanie danych

Runtime source of truth dla lokalnego formatowania danych znajduje się w `apps/web/src/design-system/foundations/runtime/formatters.ts`. Konsumenci nie składają ręcznie liczb, walut, procentów, świeżości ani zakresów dat.

Przykłady dla `pl`:

- liczba: `1 284 590,42`;
- waluta: `248 950,80 zł`;
- wynik: `18,6%`;
- aktualność: `4 minuty temu`;
- zakres dat: `1–31 lip 2026`.

Zakres dat jest wartością tekstową formatowaną przez Foundation runtime. Jego przykład w Fundamentach pozostaje płaski — bez dodatkowej karty lub powierzchni wewnątrz sekcji. Kontrolka wyboru dat należy do komponentu/wzorca, który ją konsumuje; 00.02 nie tworzy drugiego DateRangePicker.

Kwoty i KPI używają cyfr tabelarycznych tam, gdzie stabilność szerokości wartości ma znaczenie dla porównania kolumn lub kart.

## Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.
