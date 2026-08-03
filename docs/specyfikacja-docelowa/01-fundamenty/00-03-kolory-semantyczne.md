---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
story_id: "00.03"
story_title: "Kolory semantyczne"
decision_status: "candidate"
prototype_status: "implemented"
production_status: "not_started"
test_status: "candidate"
applies_to:
  - desktop
  - light
  - dark
  - pl
  - comfortable
  - full_motion
approved_commit: ""
approved_evidence: ""
owner: Artur Wiśniewski
updated_at: 2026-08-03
status: stage-01-candidate
---

# Kolory semantyczne

## Decyzja

Kolor jest rolą semantyczną. Akcent marki nie komunikuje warning ani critical, a paleta danych nie zastępuje statusów systemowych.

## Tokeny kanoniczne

- powierzchnie: `--pd-canvas`, `--pd-surface`, `--pd-surface-subtle`, `--pd-surface-raised`, `--pd-surface-overlay`, `--pd-surface-data`, `--pd-surface-panel`
- tekst: `--pd-text`, `--pd-text-secondary`, `--pd-text-muted`
- separatory: `--pd-separator-subtle`, `--pd-separator`, `--pd-separator-strong`
- statusy: `--pd-status-info`, `--pd-status-success`, `--pd-status-warning`, `--pd-status-danger`, `--pd-status-neutral` oraz warianty subtle/border
- dane: `--pd-data-*`

## Reguły

- `danger` jest nazwą tokenu koloru, nie publiczną wartością statusu komponentu
- `critical` mapuje się wizualnie na `--pd-status-danger`
- nie używać starych nazw `legacy surface alias`, `legacy border alias` ani `legacy text alias`
- drobne odchylenie kontrastu w B2B jest rekomendacją, jeśli nie blokuje czytelności

## Status odbioru Etapu 01

- Dokument opisuje candidate desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "candidate"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.
