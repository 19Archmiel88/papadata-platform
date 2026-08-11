---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: accepted
updated_at: 2026-08-11T12:00:00+02:00
---

# Readiness operacyjny

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.08 |
| Nazwa polska | Readiness operacyjny |
| Nazwa techniczna | readiness-operacyjny |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | accepted wzorca Storybook; decyzja wizualna zaakceptowana właścicielsko |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Akceptacja właścicielska | `true` — zaakceptowane właścicielsko dla zakresu Storybook/pattern-only |
| Status Storybooka | `18 Wzorce interfejsu/Readiness operacyjny` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec pokazuje przekrojową gotowość operacyjną przez StatusBadge, InlineNotice i listy separatorowe. Stany danych wykresów analitycznych pozostają własnością 15.08 ChartDataState.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

## Anatomia

```text
status-danych-i-readiness
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo ścieżka naprawy
└── dowód Storybook / fixture / audyt
```

## Komponenty składowe

- StatusBadge
- InlineNotice

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Gotowe / synchronizacja | Gotowość i synchronizacja są widoczne przekrojowo. | Storybook + fixture |
| 2 | Opóźnienie procesu / zakres częściowy / do odświeżenia | Ograniczenia procesu danych są opisane jako wpływ na decyzję, bez przejmowania stanów 15.08. | Storybook + fixture |
| 3 | Zablokowane / niedostępne | Blokada i niedostępność są oddzielone od zwykłego ładowania. | Storybook + fixture |
| 4 | Wymaga działania | Status wskazuje potrzebny następny krok klienta. | Storybook + fixture |

## Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

## Storybook

- Title: `18 Wzorce interfejsu/Readiness operacyjny`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/DataReadinessStatus.stories.tsx`.
- Status: implemented / visible / accepted.
- Accepted: true dla zaakceptowanego zakresu Storybook/pattern-only.

## Testy i kryteria akceptacji

1. Play test sprawdza listę statusów i handoff do 15.08 ChartDataState.
2. analytics-system-v1.json pozostaje bez zmian.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
