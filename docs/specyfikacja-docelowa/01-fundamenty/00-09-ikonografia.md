---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
story_id: "00.09"
story_title: "Ikonografia"
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

# Ikonografia

## Source of truth i granica z 00.13
`00.09` definiuje język ikon: geometrię, stroke, `currentColor`, rozmiary, znaczenie i reguły użycia. Pełny katalog nazw i wariantów należy wyłącznie do `00.13 — Ikony` oraz runtime `Icon`. Provider marks i logo marki są osobnymi rodzinami.

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

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.
