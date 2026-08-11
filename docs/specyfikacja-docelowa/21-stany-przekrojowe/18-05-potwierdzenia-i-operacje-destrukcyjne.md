---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-E68E7655F9D1
status: accepted
updated_at: 2026-08-12T00:19:42+02:00
---

# Potwierdzenia i operacje destrukcyjne

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.05 |
| Nazwa polska | Potwierdzenia i operacje destrukcyjne |
| Nazwa techniczna | potwierdzenia-i-operacje-destrukcyjne |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Potwierdzenia i operacje destrukcyjne` |
| Status produkcyjny | `not_started` — zakres pattern-only |
| Status testów | `passing` — fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec pokazuje świadome potwierdzenie operacji destrukcyjnej przez realny `AlertDialog` i `Button`. Story rozdziela otwarcie potwierdzenia, jasny opis skutku, anulowanie, zamknięcie Escape z powrotem focusu oraz potwierdzenie destrukcyjnej akcji.

Zakres jest Storybook/pattern-only. Dokument nie dodaje approval, OTP, MFA, typed confirmation ani domenowego endpointu wykonania operacji.

## Anatomia

```text
potwierdzenia-i-operacje-destrukcyjne
├── opis operacji i skutku
├── akcja otwarcia potwierdzenia
├── AlertDialog z opisem skutku
├── anulowanie lub destrukcyjne potwierdzenie
└── status decyzji użytkownika
```

## Komponenty składowe

- AlertDialog
- Button
- InlineNotice
- StatusBadge

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Otwarcie potwierdzenia | Przycisk otwiera `AlertDialog` z rolą `alertdialog`. | Storybook + play |
| 2 | Jasny opis skutku | Treść dialogu opisuje konsekwencję dla integracji i synchronizacji danych. | Storybook + play |
| 3 | Anulowanie | Akcja anulowania zamyka dialog i nie wykonuje operacji. | Storybook + play |
| 4 | Escape i focus restore | Escape zamyka realny overlay, a focus wraca do przycisku otwarcia. | Storybook + play |
| 5 | Destrukcyjne potwierdzenie | Potwierdzenie używa wariantu destrukcyjnego i zapisuje wynik w stanie story. | Storybook + play |

## Poza zakresem

- typed confirmation;
- OTP, MFA albo reauthentication;
- approval lub drugi approver;
- loading/result z domenowego endpointu;
- publiczny flow produkcyjny.

## Kontrakt UI

- Story nie tworzy lokalnego zamiennika `AlertDialog`, `Dialog` ani `Button`.
- AlertDialog jest jedyną warstwą potwierdzenia.
- Znaczenie ryzyka nie jest komunikowane wyłącznie kolorem.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

## Storybook

- Title: `18 Wzorce interfejsu/Potwierdzenia i operacje destrukcyjne`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/DestructiveConfirmations.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.
- Production status: not_started.

## Testy i kryteria akceptacji

1. Play test otwiera AlertDialog, sprawdza opis skutku, anuluje, zamyka Escape, sprawdza focus restore i potwierdza operację destrukcyjną.
2. Fixture deklaruje tylko PL i kroki realnie pokryte w play/audycie.
3. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
