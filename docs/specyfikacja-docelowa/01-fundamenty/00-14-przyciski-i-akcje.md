---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
story_id: "00.14"
story_title: "Przyciski i akcje"
decision_status: "accepted"
prototype_status: "implemented"
production_status: "implemented"
test_status: "passing"
applies_to:
  - desktop
  - tablet
  - mobile
  - light
  - dark
  - pl
  - en
approved_commit: "runtime-owner-migration-00.14"
approved_evidence: "apps/web/src/storybook-next/storybook-contract.json"
status: stage-01-accepted
updated_at: 2026-08-11
---

# Przyciski i akcje

## Cel

`00.14` jest aktywnym ownerem Storybooka dla systemu decyzji: komenda, nawigacja, akcja w danych, akcja destrukcyjna i układ mobilny. Sekcje `15` i `18` konsumują te komponenty bez lokalnej geometrii, koloru ani focusu.

## Source of truth

Publiczne React API pozostaje w `apps/web/src/design-system/components/Button`. Story `00 Fundamenty/05 Akcje i wejścia/Przyciski i akcje` jest kanoniczną prezentacją Storybooka. Dokument `04-komponenty-bazowe/10-02-przyciski-i-akcje.md` zostaje kontraktem runtime/reference.

## Zakres

- `Button` jako command/submit;
- `TextAction` jako lekka komenda w treści, tabeli lub komunikacie;
- `LinkAction` jako nawigacja przez `<a href>`;
- `IconButton` jako komenda ikonowa z jawną etykietą;
- `ButtonGroup`, loading, disabled, danger, full-width i mobile;
- kontrakt kreski aktywności bez zmiany layoutu.

## Granice

`Button` nie ma wariantu link. Komponenty danych, wykresów i wzorców nie tworzą własnych przycisków ani lokalnych override'ów `.pd-button`, `.pd-icon-button` lub `.pd-inline-action`.
