---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
story_id: "00.07"
story_title: "Linie i separacja"
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
approved_commit: "316c0b6e2ee862b5b8ea687eef6849698610c046"
approved_evidence: "foundation-evidence/manifest.json"
owner: Artur Wiśniewski
updated_at: 2026-08-03
status: stage-01-accepted
---

# Linie i separacja

## Decyzja

Hairline divider i kontrolowana separacja są domyślnym sposobem budowania hierarchii, zamiast mnożenia kart i obramowań.

## Tokeny

- `--pd-separator-subtle` dla podziałów wewnętrznych
- `--pd-separator` dla granic regionów
- `--pd-separator-strong` dla mocniejszej granicy powierzchni
- `--pd-focus-visible` dla fokusu
- `--pd-status-danger` dla krytycznych granic ryzyka

## Reguły

- active, focus i critical mają osobne role
- status critical nie jest zwykłym active border
- separator nie może być używany jako dekoracyjna ramka każdego elementu
- stara nazwa `legacy border alias` nie jest publicznym tokenem

## Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.
