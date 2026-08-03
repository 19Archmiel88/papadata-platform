---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
story_id: "00.05"
story_title: "Spacing i grid"
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
approved_commit: "421da5ab58a6a26fdf952a41841cb2679ce6222d"
approved_evidence: "foundation-evidence/manifest.json"
owner: Artur Wiśniewski
updated_at: 2026-08-03
status: stage-01-accepted
---

# Spacing i grid

## Decyzja

Skala odstępów bazuje na 4 px. Desktop light/dark jest baselineem Etapu 01; mobile, tablet i pełna responsywność pozostają poza zamrożeniem.

## Tokeny

- `--pd-space-0` do `--pd-space-24` opisują rytm odstępów
- `--pd-grid-gutter`, `--pd-grid-columns-wide`, `--pd-grid-columns-tablet`, `--pd-grid-columns-mobile` opisują obecny kontrakt gridu
- density comfortable i compact są trybami runtime, ale accepted baseline Etapu 01 dotyczy comfortable

## Reguły

- nie deklarować mobile jako zakończonego baselineu
- zoom 200% nie może usuwać funkcji
- tabele poniżej użytecznego minimum przechodzą w scroll lub widok uproszczony
- nowy breakpoint wymaga osobnej decyzji responsive

## Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "candidate"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.
