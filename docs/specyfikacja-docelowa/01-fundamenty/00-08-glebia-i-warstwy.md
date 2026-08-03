---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
story_id: "00.08"
story_title: "Głębia i warstwy"
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

# Głębia i warstwy

## Decyzja

Warstwa opisuje odpowiedzialność interfejsu, nie przypadkową wartość `z-index`. Cień służy wyłącznie warstwom nakładanym i technicznej separacji.

## Kontrakt warstw

| Rola | Token CSS | Wartość | Zastosowanie |
|---|---|---:|---|
| underlay | `--pd-layer-underlay` | -1 | dekoracyjne elementy pod zawartością |
| base | `--pd-layer-base` | 0 | standardowy dokument |
| sticky | `--pd-layer-sticky` | 10 | elementy przyklejone |
| popover | `--pd-layer-popover` | 20 | dropdowny, menu, tooltipy |
| modal | `--pd-layer-modal` | 30 | dialogi i blokujące overlaye |
| toast | `--pd-layer-toast` | 40 | komunikaty najwyższej warstwy |

## Reguły

- lokalny stacking context jest dopuszczalny tylko wewnątrz komponentu
- globalne overlaye używają ról `layerTokens` i `layerContract`
- `--pd-shadow-control`, `--pd-shadow-raised`, `--pd-shadow-floating`, `--pd-shadow-overlay` nie zastępują warstwy semantycznej
- nowa globalna warstwa wymaga aktualizacji CSS, TS i dokumentacji

## Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.
