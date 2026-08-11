---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-2955643C98C1
status: accepted
updated_at: 2026-08-12T00:19:42+02:00
---

# Formularze złożone i kreatory

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.09 |
| Nazwa polska | Formularze złożone i kreatory |
| Nazwa techniczna | formularze-zlozone-i-kreatory |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Formularze złożone i kreatory` |
| Status produkcyjny | `not_started` — zakres pattern-only |
| Status testów | `passing` — fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec pokazuje wieloetapowy formularz złożony z istniejących komponentów: `TextField`, `Select`, `Checkbox`, `Dialog`, `Button` i `InlineNotice`. Story obejmuje sekwencję kroków, walidację pól wymaganych, zapis szkicu, dialog zmian niezapisanych oraz wysłanie konfiguracji.

Zakres jest Storybook/pattern-only. Dokument nie tworzy publicznego komponentu `Wizard`, nie definiuje nowych inputów i nie deklaruje server validation bez kontraktu backendowego.

## Anatomia

```text
formularze-zlozone-i-kreatory
├── wskaźnik kroków
├── pola formularzowe z 00.15
├── walidacja i status szkicu
├── Dialog zmian niezapisanych
└── przegląd i wysłanie
```

## Komponenty składowe

- TextField
- Select
- Checkbox
- Dialog
- Button
- InlineNotice

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Sekwencja kroków | Story przechodzi przez dane podstawowe, warunki i przegląd. | Storybook + play |
| 2 | Walidacja | Próba przejścia bez wymaganych danych pokazuje summary i komunikaty pól. | Storybook + play |
| 3 | Zmiany niezapisane | Anulowanie brudnego formularza otwiera realny `Dialog`. | Storybook + play |
| 4 | Zapis szkicu | Akcja zapisuje stan story bez deklarowania backendu. | Storybook |
| 5 | Submit processing | `Button.loading` pokazuje wysyłanie i końcowy status. | Storybook + play |

## Poza zakresem

- publiczny komponent `Wizard`;
- server validation i partial recovery bez kontraktu backendowego;
- routing resume flow;
- nowe komponenty inputów.

## Kontrakt UI

- Story używa wyłącznie istniejących pól i kontrolek zgodnych z 00.15.
- Sekwencja kroków jest kompozycją story, nie nowym publicznym API.
- Dialog zmian niezapisanych korzysta z runtime `Dialog`.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

## Storybook

- Title: `18 Wzorce interfejsu/Formularze złożone i kreatory`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/ComplexFormsWizards.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.
- Production status: not_started.

## Testy i kryteria akceptacji

1. Play test sprawdza walidację, uzupełnienie TextField, wybór Select, Checkbox, przejście do przeglądu, Dialog zmian niezapisanych i submit.
2. Fixture deklaruje tylko PL i kroki realnie pokryte w play/audycie.
3. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
