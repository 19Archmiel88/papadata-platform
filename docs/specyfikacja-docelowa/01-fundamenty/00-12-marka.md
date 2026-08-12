---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
story_id: "00.12"
story_title: "Marka"
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
approved_commit: "runtime-owner-migration-00.12"
approved_evidence: "apps/web/src/storybook-next/storybook-contract.json"
status: stage-01-accepted
updated_at: 2026-08-11
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Marka

## Cel

`00.12` jest aktywnym ownerem Storybooka dla użycia marki PapaData. Pokazuje lockup, sygnet, wordmark, rozmiary oraz zachowanie light/dark w tym samym materiale wizualnym co pozostałe Fundamenty.

## Source of truth

Publiczne React API pozostaje w `apps/web/src/design-system/icons/PapaDataBrand.tsx`. Ten dokument i story `00 Fundamenty/03 Marka` są kanonicznym miejscem prezentacji marki w Storybooku. Dokument `04-komponenty-bazowe/10-01-marka.md` zostaje kontraktem runtime/reference, a nie aktywną sekcją Storybooka.

## Zakres

- lockup, mark, wordmark i wariant dekoracyjny;
- rozmiary small, medium i large;
- nazwa dostępna i `aria-hidden` dla wariantu dekoracyjnego;
- użycie marki w app shell, auth, empty state i eksporcie dokumentu;
- brak dekoracyjnego `glow` w bazowym API.

## Granice

Marka nie definiuje całego systemu wizualnego. Canvas, kolor, typografia, geometria i warstwy należą do `00.01-00.11`. Provider marks i logotypy integracji są osobną rodziną.
