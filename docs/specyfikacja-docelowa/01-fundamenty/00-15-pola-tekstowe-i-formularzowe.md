---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
story_id: "00.15"
story_title: "Pola tekstowe i formularzowe"
decision_status: "review"
prototype_status: "implemented"
production_status: "implemented"
test_status: "partial"
applies_to:
  - desktop
  - tablet
  - mobile
  - light
  - dark
  - pl
  - en
approved_commit: "runtime-owner-migration-00.15"
approved_evidence: "apps/web/src/storybook-next/storybook-contract.json"
status: stage-01-review
updated_at: 2026-08-11
---

# Pola tekstowe i formularzowe

## Cel

`00.15` jest aktywnym ownerem Storybooka dla wejść danych: etykieta, helper, error, required, disabled, read-only oraz walidacja. Fundament określa zachowanie i wygląd pola, ale nie narzuca jednej biblioteki formularzy, kalendarza ani zaawansowanych kontrolek.

## Source of truth

Publiczne React API pozostaje w `apps/web/src/design-system/components/Field` oraz `apps/web/src/design-system/components/VerificationCodeInput`. Story `00 Fundamenty/05 Akcje i wejścia/Pola tekstowe i formularzowe` jest kanoniczną prezentacją Storybooka. Dokument `04-komponenty-bazowe/10-03-pola-tekstowe-i-formularzowe.md` zostaje kontraktem runtime/reference.

## Zakres

- `TextField`, `PasswordField`, `Textarea`, `FileInput` i `VerificationCodeInput`;
- label, helper text, message, required, error, disabled i read-only;
- loading/validating jako przyszłe rozszerzenie tego samego wzorca;
- jeden zewnętrzny focus na właścicielu kontrolki;
- PL/EN, długie teksty, reflow i zoom 200%.

## Granice

Select, combobox, date picker, kalendarz, checkbox, radio, switch i multi-select mogą korzystać z bibliotek zewnętrznych, ale ich materiał, focus, label, helper i walidacja mają dziedziczyć decyzje `00.15`.
