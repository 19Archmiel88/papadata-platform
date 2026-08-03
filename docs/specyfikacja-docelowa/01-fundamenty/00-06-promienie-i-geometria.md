---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
story_id: "00.06"
story_title: "Promienie i geometria"
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

# Promienie i geometria

## Decyzja

Geometria jest techniczna i umiarkowana. Promienie są małe, a kształt nie zastępuje semantyki ani statusu.

## Tokeny

- `--pd-radius-none`, `--pd-radius-subtle`, `--pd-radius-small`, `--pd-radius-control`, `--pd-radius-surface`, `--pd-radius-overlay`, `--pd-radius-pill`
- `--pd-border-width-subtle`, `--pd-border-width-strong`
- cienie są opisane w `00.08 Głębia i warstwy`

## Reguły

- kontrolki używają promieni technicznych
- powierzchnie nie tworzą kart zagnieżdżonych bez osobnego cyklu interakcji
- focus nie jest cieniem dekoracyjnym
- zmiana globalnej roli promienia wymaga tokenu, nie lokalnego CSS

## Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "candidate"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.
