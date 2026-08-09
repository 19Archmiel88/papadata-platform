---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: review
updated_at: 2026-08-09T12:00:00+02:00
---

# Panele szczegółów, dowodów i rekomendacji

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.07 |
| Nazwa polska | Panele szczegółów, dowodów i rekomendacji |
| Nazwa techniczna | panele-szczegolow-dowodow-i-rekomendacji |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | review wzorca Storybook; decyzja wizualna oczekuje na akceptację właścicielską |
| Priorytet | P1 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — REVIEW |
| Akceptacja właścicielska | `false` — wymaga osobnej akceptacji właściciela produktu |
| Status Storybooka | `18 Wzorce interfejsu/Panele szczegółów, dowodów i rekomendacji` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec używa Drawer jako realnej warstwy panelu oraz Tabs dla szczegółów, dowodów i rekomendacji. To jedyna semantycznie uzasadniona zamknięta powierzchnia w zakresie 18.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

## Anatomia

```text
panele-szczegolow-dowodow-i-rekomendacji
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo recovery
└── dowód Storybook / fixture / audyt
```

## Komponenty składowe

- Drawer
- Tabs
- DataList
- InlineNotice
- StatusBadge
- Button
- TextAction

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Detail panel | Drawer pokazuje szczegóły decyzji bez lokalnego panelu zastępczego. | Storybook + fixture |
| 2 | Evidence panel | Dowody są listą z metadanymi źródeł. | Storybook + fixture |
| 3 | Recommendation panel | Rekomendacja pokazuje decyzję i ograniczenia. | Storybook + fixture |
| 4 | Escape / focus restore | Play test otwiera Drawer, zamyka Escape i sprawdza powrót focusu. | Storybook + fixture |

## Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

## Storybook

- Title: `18 Wzorce interfejsu/Panele szczegółów, dowodów i rekomendacji`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/DetailEvidenceRecommendationPanels.stories.tsx`.
- Status: implemented / visible / review.
- Accepted: false, do czasu osobnej akceptacji wizualnej.

## Testy i kryteria akceptacji

1. Play test sprawdza dialog, Tabs, Escape close i focus restoration.
2. Story kończy z otwartym panelem rekomendacji do screenshotu.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
