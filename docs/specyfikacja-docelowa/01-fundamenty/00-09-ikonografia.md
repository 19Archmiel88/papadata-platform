---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
story_id: "00.09"
story_title: "Ikonografia"
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

# Ikonografia

## Decyzja

Ikona wspiera etykietę i strukturę, ale nie zastępuje nazwy dostępnościowej w akcji krytycznej. Rejestr ikon i brand mark są oddzielone.

## Zasady

- icon-only button zawsze ma accessible name
- status nie jest przekazywany wyłącznie ikoną lub kolorem
- logo i provider marks nie są zwykłymi ikonami systemu
- rozmiar ikony wynika z wariantu kontrolki
- tekst ikonografii używa `--pd-text`, nie starego aliasu `--pd-text`

## Zakres

- ikony nawigacji, statusów, akcji, danych, AI, security, billing i pomocy
- `Icon`, `PapaDataBrand`, `PapaDataIconName` oraz publiczny rejestr nazw ikon
- brak lokalnych zestawów ikon w stories bez dopisania do rejestru

## Status odbioru Etapu 01

- Dokument opisuje candidate desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "candidate"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.
