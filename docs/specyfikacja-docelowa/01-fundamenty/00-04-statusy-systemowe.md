---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
story_id: "00.04"
story_title: "Statusy systemowe"
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

# Statusy systemowe

## Decyzja

Jeden publiczny słownik statusów obowiązuje komponenty, Fundamenty i Laboratorium: `neutral`, `info`, `success`, `warning`, `critical`, `processing`.

## Mapowanie

| Status API | Znaczenie | Token wizualny |
|---|---|---|
| neutral | brak oceny lub stan pomocniczy | `--pd-status-neutral` |
| info | informacja bez pilnej reakcji | `--pd-status-info` |
| success | zakończenie poprawne | `--pd-status-success` |
| warning | ryzyko lub opóźnienie | `--pd-status-warning` |
| critical | błąd, blokada, nieodwracalny skutek | `--pd-status-danger` |
| processing | operacja trwa | `--pd-brand-accent` |

## Reguły

- `danger` pozostaje wyłącznie nazwą tokenu koloru lub lokalnej roli obramowania/separatora
- `muted` nie jest statusem domenowym i mapuje się na `neutral` albo rolę tekstową
- status nie może być przekazywany wyłącznie kolorem
- `implemented` oznacza tylko istnienie story lub kodu referencyjnego, nie akceptację ani produkcję

## Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.
