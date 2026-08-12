---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-4D5F69650D7B
status: accepted
updated_at: 2026-08-12T00:19:42+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Approval, step-up i ochrona zmian

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.06 |
| Nazwa polska | Approval, step-up i ochrona zmian |
| Nazwa techniczna | approval-step-up-i-ochrona-zmian |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Approval, step-up i ochrona zmian` |
| Status produkcyjny | `not_started` — zakres pattern-only |
| Status testów | `passing` — fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec pokazuje dodatkowy warunek autoryzacji przed dopuszczeniem zmiany chronionej. `ApprovalPanel` prezentuje `subjectId`, `subjectLabel`, `risk`, listę approverów i `expiresAt`; akcja pozostaje zablokowana, dopóki approval nie jest zatwierdzony.

18.06 nie jest potwierdzeniem operacji. 18.05 odpowiada na pytanie „czy na pewno wykonać operację?”, a 18.06 odpowiada „czy warunek autoryzacji/approval jest spełniony?”.

## Anatomia

```text
approval-step-up-i-ochrona-zmian
├── opis zmiany chronionej
├── ApprovalPanel
├── status pending / approved / rejected
├── ryzyko, approverzy i wygaśnięcie
└── akcja zablokowana do spełnienia warunku
```

## Komponenty składowe

- ApprovalPanel
- Button
- InlineNotice
- StatusBadge

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Pending approval | Jeden approver oczekuje, a akcja chroniona jest disabled. | Storybook + play |
| 2 | Approved approval | Wszyscy approverzy zatwierdzili zmianę, a akcja jest dostępna. | Storybook + play |
| 3 | Rejected approval | Odrzucony approval blokuje akcję i pokazuje krytyczny komunikat. | Storybook + play |
| 4 | Ryzyko i wygaśnięcie | Panel pokazuje ryzyko wysokie oraz termin wygaśnięcia approval. | Storybook + play |
| 5 | Blokada akcji | Button pozostaje zablokowany do spełnienia warunku. | Storybook + play |

## Poza zakresem

- reauthentication, MFA i step-up UI;
- lokalny flow 25.09;
- potwierdzenie destrukcyjne z 18.05;
- approval backendowy lub domenowy endpoint wykonania zmiany.

Step-up ma handoff do 25.09 i wymaga osobnego właściciela procesu. Ten dokument nie udaje MFA ani ponownego uwierzytelnienia.

## Kontrakt UI

- Story nie tworzy lokalnego zamiennika `ApprovalPanel`.
- Status approval jest jawny tekstowo, nie wyłącznie kolorem.
- Akcja chroniona jest widoczna, lecz niedostępna do spełnienia warunku.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

## Storybook

- Title: `18 Wzorce interfejsu/Approval, step-up i ochrona zmian`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/ApprovalProtection.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.
- Production status: not_started.

## Testy i kryteria akceptacji

1. Play test sprawdza pending, approved, rejected, blokadę przycisku i wykonanie akcji dopiero po approval.
2. Fixture deklaruje tylko PL i kroki realnie pokryte w play/audycie.
3. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
