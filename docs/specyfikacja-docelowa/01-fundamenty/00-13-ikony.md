---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
story_id: "00.13"
story_title: "Ikony"
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
approved_commit: "runtime-owner-migration-00.13"
approved_evidence: "apps/web/src/storybook-next/storybook-contract.json"
status: stage-01-accepted
updated_at: 2026-08-11
---

# Ikony

## Cel

`00.13` jest aktywnym ownerem Storybooka dla runtime komponentu `Icon` i pełnego katalogu ikon systemowych. Fundament `00.09` definiuje zasady języka ikon, a `00.13` pokazuje katalog, rozmiary i dostępność komponentu.

## Source of truth

Publiczne React API pozostaje w `apps/web/src/design-system/icons/Icon.tsx`. Story `00 Fundamenty/04 Ikony` jest jedynym katalogiem nazw i wariantów ikon w Storybooku. Dokument `04-komponenty-bazowe/10-11-ikony.md` zostaje kontraktem runtime/reference.

## Zakres

- `currentColor`, `strokeWidth`, viewBox i rozmiary 16, 20, 24;
- wariant dekoracyjny i informacyjny;
- dostępna nazwa przez `label`;
- kategorie funkcjonalne: nawigacja, dane, integracje, operacje i status;
- light/dark oraz PL/EN bez zmiany semantyki.

## Granice

Nie tworzymy lokalnych list ikon w sekcjach `15`, `18` ani w story ekranów. Nowa ikona trafia do runtime katalogu `Icon` i jest dokumentowana w `00.13`.
