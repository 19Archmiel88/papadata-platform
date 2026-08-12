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
approved_commit: "94ea15ab11d018252944b36fdc55df8b7462e30a"
approved_evidence: "foundation-evidence/manifest.json"
owner: Artur Wiśniewski
updated_at: 2026-08-03
status: stage-01-accepted
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Linie i separacja

## Source of truth i handoff z 05.04
Ten dokument jest kanonicznym właścicielem separatorów, obramowań i ról linii. `05.04 — Separatory i obramowania` jest decision recordem Laboratorium. Po akceptacji decyzje z 05.04 są promowane tutaj i nie tworzą drugiej specyfikacji.

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
