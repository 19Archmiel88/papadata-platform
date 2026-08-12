---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
story_id: "00.01"
story_title: "Kierunek wizualny"
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

# Kierunek wizualny

## Decyzja

PapaData buduje wrażenie premium przez precyzję, kontrolowaną gęstość, czytelne dowody i spokojną hierarchię. Zaakceptowany Storybook desktop light/dark jest źródłem prawdy dla kierunku wizualnego Etapu 01.

## Zakres baselineu

- desktop, light, dark, PL, comfortable, full motion
- bez mobile, tabletu, pełnej responsywności i ekranów produkcyjnych
- Laboratorium 05.01-05.05 pozostaje prototypem w review

## Zasady

- dane i decyzja przed dekoracją
- separatory, typografia i rytm przed mnożeniem kart
- light i dark mają tę samą geometrię
- zmiana zaakceptowanego stylu wymaga jawnej decyzji
- helper Storybooka nie jest publicznym API komponentu

## Status odbioru Etapu 01

- Dokument opisuje accepted desktop baseline light/dark dla stories `00.01-00.11`.
- `test_status: "passing"` oznacza, że finalny status `passing` wymaga manifestu i świadomej akceptacji zrzutów.
- Laboratorium `05.01-05.05` pozostaje poza frozen baseline i ma status review.
