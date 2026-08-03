---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
story_id: "00.10"
story_title: "Motion"
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

# Motion

## Decyzja

Motion komunikuje zmianę stanu i warstwy, ale nie przenosi informacji samodzielnie. Reduced motion nie może usuwać informacji o stanie.

## Czasy

| Rola | Token | Czas |
|---|---|---:|
| reakcja natychmiastowa | `--pd-motion-duration-instant` | 70 ms |
| mała zmiana stanu | `--pd-motion-duration-fast` | 110 ms |
| standardowe przejście | `--pd-motion-duration-standard` | 180 ms |
| większa zmiana powierzchni | `--pd-motion-duration-deliberate` | 240 ms |

## Reduced motion

- skraca przejścia do wartości natychmiastowych
- usuwa dekoracyjny ruch i dystans `--pd-motion-distance`
- nie usuwa komunikatu, focus, statusu ani informacji o zakończeniu operacji
- skeleton zachowuje finalną geometrię

## Status odbioru Etapu 01

- Dokument opisuje candidate desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "candidate"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.
