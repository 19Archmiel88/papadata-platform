---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: review
updated_at: 2026-08-09T12:00:00+02:00
---

# Układ strony i sekcji

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 18.01 |
| Nazwa polska | Układ strony i sekcji |
| Nazwa techniczna | uklad-strony-i-sekcji |
| Typ dokumentu | wzorzec przekrojowy |
| Wersja | 1.0 |
| Status kontraktu | review wzorca Storybook; decyzja wizualna oczekuje na akceptację właścicielską |
| Priorytet | P0 |
| Właściciel | Design System |
| Moduł | Wzorce interfejsu — 18 |

| Status implementacji | WDROŻONE W STORYBOOK — REVIEW |
| Akceptacja właścicielska | `false` — wymaga osobnej akceptacji właściciela produktu |
| Status Storybooka | `18 Wzorce interfejsu/Układ strony i sekcji` |
| Status testów | fixture + play/audit dopasowane do realnej implementacji |

## Cel i realny zakres

Wzorzec pokazuje page header, section header, content region, split view i master-detail jako otwarty układ oparty o semantyczne regiony, typografię, rytm i separatory.

Zakres jest Storybook/pattern-only. Dokument nie dodaje nowego publicznego runtime componentu, nie zmienia ownerów 15.* i nie zmienia `runtime-component-api.csv` ani `analytics-system-v1.json`.

## Anatomia

```text
uklad-strony-i-sekcji
├── nagłówek semantyczny
├── treść wzorca
├── status lub ograniczenie
├── akcja albo recovery
└── dowód Storybook / fixture / audyt
```

## Komponenty składowe

- StoryPresentationPage
- StoryPresentationSection
- StoryPresentationMeta
- InlineNotice
- StatusBadge
- TextAction

Wzorzec używa istniejących komponentów bazowych. Lokalne klasy Storybook mają prefiks `pd-x18-*` i służą wyłącznie do układu, separatorów oraz rytmu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | Page header | Nagłówek strony ustawia kontekst, status i akcję bez osobnego kontenera. | Storybook + fixture |
| 2 | Content region | Regiony są nazwane i dostępne jako semantyczne sekcje. | Storybook + fixture |
| 3 | Split view | Treść i region poboczny są rozdzielone rytmem oraz linią, nie kartami. | Storybook + fixture |
| 4 | Master-detail | Wybór z listy zmienia szczegół bez przeładowania strony. | Storybook + fixture |

## Kontrakt UI

- Domyślny układ używa typografii, rytmu pionowego, separatorów i lekkich list.
- Zamknięte powierzchnie występują tylko wtedy, gdy są semantycznie uzasadnione przez komponent bazowy.
- Story nie tworzy lokalnych zamienników Button, TextAction, LinkAction, Select, DataTable, StatusBadge, EmptyState, ErrorState, Skeleton, Spinner, Drawer ani Tabs.
- Story nie deklaruje playSteps ani visualAssertions bez pokrycia w runtime, play teście albo audycie.

## Storybook

- Title: `18 Wzorce interfejsu/Układ strony i sekcji`.
- File: `apps/web/src/storybook-next/stories/18-cross-cutting-patterns/PageSectionLayout.stories.tsx`.
- Status: implemented / visible / review.
- Accepted: false, do czasu osobnej akceptacji wizualnej.

## Testy i kryteria akceptacji

1. Play test sprawdza heading, main landmark, nazwane regiony i zmianę szczegółu.
2. Audyt Storybook obejmuje 1440, 768, 390 oraz zoom 200%.
3. Lokalny CSS nie override'uje `.pd-f0-*`, `.pd-button`, `.pd-inline-action`, `.pd-icon-button` ani produkcyjnych klas komponentów.
4. Mobile 390 i zoom 200% są objęte audytem Storybook, jeżeli fixture deklaruje brak poziomego scrolla.
